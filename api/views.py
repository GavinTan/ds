from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, exceptions, permissions, authentication, status
from rest_framework.decorators import action, renderer_classes, permission_classes
from django.contrib.auth.models import update_last_login
from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.dateparse import parse_datetime
from .serializers import *
from .filters import *
from datetime import datetime, timedelta
import numpy


# Create your views here.


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MultipleDelete:
    def __init__(self):
        self.queryset = None

    @action(methods=['delete'], detail=False, url_path='multiple_delete')
    def multiple_delete(self, request, *args, **kwargs):
        if request.data.get('ids'):
            del_list_id = request.data.get('ids')

            if del_list_id:
                self.queryset.filter(id__in=del_list_id).delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                raise exceptions.NotFound()

        raise exceptions.ValidationError({'detail': '没有删除的ids列表'})


class UserView(viewsets.ModelViewSet, MultipleDelete):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilter

    @action(methods=['post'], detail=False, url_path='login', authentication_classes=[],
            permission_classes=[permissions.AllowAny])
    def login(self, request, *args, **kwargs):
        data = {}
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_active:
                if datetime.now().isoweekday() not in user.limit_login_time:
                    update_last_login(None, user)
                    refresh = RefreshToken.for_user(user)
                    data['token'] = str(refresh.access_token)
                    data['status'] = 'ok'
                else:
                    data['status'] = 'error'
                    data['error'] = '当前属于限制登录系统时间段！'
            else:
                data['status'] = 'error'
                data['error'] = '用户已禁用，请联系管理员！'
        else:
            data['status'] = 'error'

        return Response(data)


class VarietyView(viewsets.ModelViewSet, MultipleDelete):
    queryset = Variety.objects.all()
    serializer_class = VarietySerializer
    filterset_class = VarietyFilter

    def list(self, request, *args, **kwargs):
        a = self.request.query_params.get('a')
        c = self.request.query_params.get('c')
        uid = self.request.query_params.get('uid')
        queryset = self.get_queryset().filter(user_id=uid)

        user = User.objects.filter(id=uid).first()
        if user:
            if user.is_superuser:
                queryset = self.get_queryset()

        if a == 'get_variety_list':
            queryset = queryset.filter().exclude(
                id__in=PriceData.objects.filter(date=c).values_list('variety', flat=True))

        # serializer = self.get_serializer(queryset, many=True)
        self.queryset = queryset
        return super().list(request, *args, **kwargs)

    @action(methods=['post'], detail=False, url_path='action')
    def action(self, request, *args, **kwargs):
        a = request.query_params.get('a')
        uid = request.data.get('uid')
        queryset = self.get_queryset().filter(user_id=uid)
        if a == 'get_select_category_list':
            categories = queryset.order_by('create_time').values_list('categories', flat=True)
            data = []
            for i in categories:
                for c in i:
                    for k, v in c.items():
                        data.append({'label': v, 'value': v})
            return Response(data)
        return Response()


class PriceDataView(viewsets.ModelViewSet, MultipleDelete):
    queryset = PriceData.objects.all()
    serializer_class = PriceDataSerializer
    filterset_class = PriceDataFilter

    def list(self, request, *args, **kwargs):
        uid = self.request.query_params.get('uid')
        queryset = self.get_queryset().filter(user_id=uid)

        user = User.objects.filter(id=uid).first()
        if user:
            if user.is_superuser:
                queryset = self.get_queryset()

        self.queryset = queryset.order_by('date')
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        create = super().create(request, *args, **kwargs)
        new_data = []
        data = request.data
        categories = data.pop('categories')
        for i, e in enumerate(categories):
            price = e.get('price')
            if price:
                data['category'] = e.get(f'category{i + 1}')
                data['price'] = price
                new_data.append(data.copy())

        serializer = InputPriceRecordSerializer(data=new_data, many=isinstance(new_data, list))
        if serializer.is_valid():
            serializer.save()
            return create
        else:
            raise exceptions.ValidationError({'detail': serializer.errors})

    def update(self, request, *args, **kwargs):
        update = super().update(request, *args, **kwargs)
        data = request.data
        categories = data.pop('categories')
        user = data.pop('user')
        variety = data.pop('variety')
        data.pop('id')
        for i, e in enumerate(categories):
            price = e.get('price')
            if price:
                data['category'] = e.get(f'category{i + 1}')
                data['price'] = price
                data['user_id'] = user
                data['variety_id'] = variety
                InputPriceRecord.objects.update_or_create(date=data.get('date'), category=e.get(f'category{i + 1}'),
                                                          user_id=user, defaults=data.copy())
        return update

    @action(methods=['post'], detail=False, url_path='action')
    def action(self, request, *args, **kwargs):
        a = self.request.query_params.get('a')
        uid = request.data.get('uid')

        if a == 'get_chart1_data':
            data = {
                'x_data': [],
                'legend_data': [],
                'series_data': []
            }
            if request.data.get('dateRange'):
                date_range = [parse_datetime(request.data.get('dateRange')[0]).date(), parse_datetime(request.data.get('dateRange')[1]).date()]
                queryset = self.get_queryset().filter(date__range=date_range, user_id=uid).order_by('date')
            else:
                queryset = self.get_queryset().filter(user_id=uid).order_by('date').defer('variety', 'create_time', 'update_time')
            for i in queryset:
                if i.date not in data['x_data']:
                    data['x_data'].append(i.date)

                for index, e in enumerate(i.categories):
                    category = e.get(f'category{index + 1}')
                    price = e.get('price')

                    if price is None:
                        record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by(
                            '-date').first()
                        if record:
                            price = record.price

                    if category not in data['legend_data']:
                        series = {'type': 'line', 'name': category, 'showSymbol': False, 'data': [price]}
                        data['legend_data'].append(category)
                        data['series_data'].append(series)
                    else:
                        for series in data['series_data']:
                            if series.get('name') == category:
                                series.get('data').append(price)
            return Response(data)

        if a == 'get_chart2_data':
            data = {
                'x_data': [],
                'legend_data': request.data.get('selectCategory', []),
                'series_data': []
            }
            if request.data.get('dateRange'):
                date_range = [parse_datetime(request.data.get('dateRange')[0]).date(), parse_datetime(request.data.get('dateRange')[1]).date()]
                queryset = self.get_queryset().filter(date__range=date_range, user_id=uid).order_by('date')
            else:
                queryset = self.get_queryset().filter(user_id=uid).order_by('date').defer('variety', 'create_time', 'update_time')
            for category in data['legend_data']:
                series = {'type': 'line', 'showSymbol': False, 'name': category}
                price_data = []
                for i in queryset:
                    if i.date not in data['x_data']:
                        data['x_data'].append(i.date)

                    for index, e in enumerate(i.categories):
                        if category == e.get(f'category{index + 1}'):
                            price = e.get('price')
                            if price is None:
                                record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by(
                                    '-date').first()
                                if record:
                                    price = record.price

                            price_data.append(price)

                series['data'] = price_data
                data['series_data'].append(series)
            return Response(data)

        if a == 'get_chart3_data':
            data = {
                'x_data': [],
                'legend_data': [],
                'series_data': []
            }

            variety_queryset = Variety.objects.all().filter(user_id=uid).order_by('create_time').values_list('id',
                                                                                                             flat=True)[
                               :4]
            queryset = self.get_queryset().prefetch_related('variety').filter(user_id=uid).order_by('date')
            tmp_data = {
                'x_data': [],
                'legend_data': [],
                'series_data': []
            }
            for i in queryset:
                variety_id = i.variety_id
                minuend_name = ''
                n = 0
                if i.date not in data['x_data']:
                    data['x_data'].append(i.date)

                for category in i.get_price:
                    key = i.get_price.get(category)[1]
                    price = i.get_price.get(category)[0]

                    if category not in tmp_data['legend_data']:
                        series = {'name': category, 'v': list(variety_queryset).index(variety_id),
                                  'vname': i.variety.name, 'k': key, 'data': [price]}
                        tmp_data['legend_data'].append(category)
                        tmp_data['series_data'].append(series)
                    else:
                        for series in tmp_data['series_data']:
                            if series.get('name') == category:
                                series.get('data').append(price)

                    if 'category1' == key:
                        minuend_name = category
                        n = price
                    else:
                        price = n - price
                        name = f'{i.variety.name}（{minuend_name}-{category}）'
                        if name not in data['legend_data']:
                            series = {'type': 'line', 'showSymbol': False, 'name': name, 'data': [price]}
                            data['legend_data'].append(name)
                            data['series_data'].append(series)
                        else:
                            for series in data['series_data']:
                                if series.get('name') == name:
                                    series.get('data').append(price)

                    # if key in ['category1', 'category2']:
                    #     minuend = price
                    #     subtrahend = []
                    #
                    #     if variety_id in variety_queryset:
                    #         for v_index, v in enumerate(variety_queryset):
                    #             if v_index != 0:
                    #                 q = queryset.prefetch_related('variety').filter(date=i.date, variety_id=v).first()
                    #                 if list(variety_queryset).index(variety_id) == 0:
                    #                     subtrahend.append(q)
                    #                 if list(variety_queryset).index(variety_id) == 1 and v_index != 1:
                    #                     subtrahend.append(q)
                    #                 if list(variety_queryset).index(variety_id) == 2 and v_index == 3:
                    #                     subtrahend.append(q)
                    #         if list(variety_queryset).index(variety_id) == 3:
                    #             continue
                    #
                    #         for s in subtrahend:
                    #             if s:
                    #                 for s_category in s.get_price:
                    #                     if s.get_price.get(s_category)[1] == key:
                    #                         name = f"{i.variety.name}（{category}-{s_category}）"
                    #                         if name not in data['legend_data']:
                    #                             series = {'type': 'line', 'showSymbol': False, 'name': name,
                    #                                       'data': [minuend - price]}
                    #                             data['series_data'].append(series)
                    #                             data['legend_data'].append(name)
                    #
                    #                         else:
                    #                             for series in data['series_data']:
                    #                                 if series.get('name') == name:
                    #                                     series.get('data').append(minuend - price)
            cdata = {'a1': {}, 'a2': {}, 'b1': {}, 'b2': {}, 'c1': {}, 'c2': {}, 'd1': {}, 'd2': {}}
            name_list = ['a', 'b', 'c', 'd']
            for i in tmp_data['series_data']:
                key = i.get('k')
                idata = {'data': i.get('data'), 'name': i.get('name'), 'vname': i.get('vname')}
                key_list = ['category1', 'category2']
                if key in key_list:
                    if key_list.index(key) == 0:
                        cdata[f"{name_list[i.get('v')]}1"] = idata
                    if key_list.index(key) == 1:
                        cdata[f"{name_list[i.get('v')]}2"] = idata

            for k, v in cdata.items():
                minuend = v.get('data', [])
                if k == 'a1':
                    for i in ['b1', 'c1', 'd1']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)
                if k == 'a2':
                    for i in ['b2', 'c2', 'd2']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)

                if k == 'b1':
                    for i in ['c1', 'd1']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)

                if k == 'b2':
                    for i in ['c2', 'd2']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)
                if k == 'c1':
                    for i in ['d1']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)

                if k == 'c2':
                    for i in ['d2']:
                        name = f"{cdata[k].get('vname')}（{cdata[k].get('name')}-{cdata[i].get('name')}）"
                        subtrahend = cdata[i].get('data', [])
                        if subtrahend:
                            if len(minuend) != len(subtrahend):
                                if len(subtrahend) < len(minuend):
                                    for c in range(len(minuend) - len(subtrahend)):
                                        subtrahend.append(0)
                                else:
                                    for c in range(len(subtrahend) - len(minuend)):
                                        minuend.append(0)
                            series = {'type': 'line', 'showSymbol': False, 'name': name,
                                      'data': numpy.array(minuend) - numpy.array(subtrahend)}
                            data['series_data'].append(series)
                            data['legend_data'].append(name)

            return Response(data)

        if a == 'get_chart4_data':
            data = {
                'x_data': [],
                'legend_data': [],
                'series_data': []
            }

            select_category = request.data.get('selectCategory', [])
            select_date = request.data.get('date')
            date_range = [parse_datetime(select_date).date(), datetime.now().date()]
            n = {'z': 0, 'x': 0}
            queryset = self.get_queryset().filter(date__range=date_range, user_id=uid).order_by('date')
            for i in queryset:
                for index, e in enumerate(i.categories):
                    category = e.get(f'category{index + 1}')
                    price = e.get('price')
                    if price is None:
                        record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by(
                            '-date').first()
                        if record:
                            price = record.price

                    if isinstance(price, str) and price.isdigit():
                        price = int(price)

                    for c in select_category:
                        for k, v in c.items():
                            if category == v:
                                if i.date == parse_datetime(select_date).date():
                                    if k == 'category1':
                                        n['z'] = price
                                    if k == 'category2':
                                        n['x'] = price

                                if i.date not in data['x_data']:
                                    data['x_data'].append(i.date)
                                if category not in data['legend_data']:
                                    series = {'type': 'line', 'showSymbol': False, 'name': category, 'data': [price]}
                                    data['legend_data'].append(category)
                                    data['series_data'].append(series)
                                else:
                                    for series in data['series_data']:
                                        if series.get('name') == category:
                                            series.get('data').append(price)

            series1 = {'type': 'line', 'showSymbol': False, 'name': 'V', 'data': []}
            series2 = {'type': 'line', 'showSymbol': False, 'name': f"{select_category[1]['category2']}+V", 'data': []}
            if len(data['series_data']) == 2:
                for i in data['series_data']:
                    if select_category[1]['category2'] == i.get('name'):
                        for x in i.get('data'):
                            v = n['z'] - n['x']
                            series2['data'].append(x + v)
                            series1['data'].append(v)

                data['legend_data'].append(f"{select_category[1]['category2']}+V")
                data['legend_data'].append('V')
                data['series_data'].append(series1)
                data['series_data'].append(series2)

            return Response(data)

        if a == 'get_chart5_data':
            data = {
                'x_data': [],
                'legend_data': [],
                'series_data': [],
                'n': {}
            }
            select_category = request.data.get('selectCategory', [])
            select_date = request.data.get('date')
            date_range = [parse_datetime(select_date).date(), datetime.now().date()]
            queryset = self.get_queryset().filter(date__range=date_range, user_id=uid).order_by('date')
            n = {}
            for i in queryset:
                for index, e in enumerate(i.categories):
                    price = e.get('price')
                    if price is None:
                        record = InputPriceRecord.objects.filter(category=e.get(f'category{index + 1}'),
                                                                 user_id=uid).order_by(
                            '-date').first()
                        if record:
                            price = record.price

                    if isinstance(price, str) and price.isdigit():
                        price = int(price)

                    for category in [item[key] for item in select_category for key in item]:
                        if category == e.get(f'category{index + 1}'):
                            if i.date == parse_datetime(select_date).date():
                                data['n'][category] = price
                            else:
                                if i.date not in data['x_data']:
                                    data['x_data'].append(i.date)

                                if category not in data['legend_data']:
                                    series = {'type': 'line', 'showSymbol': False, 'name': category, 'data': [price]}
                                    data['series_data'].append(series)
                                    data['legend_data'].append(category)
                                else:
                                    for series in data['series_data']:
                                        if series.get('name') == category:
                                            series.get('data').append(price)
                            # else:
                            #     c = n.get(category, 0) - price
                            #     if n.get(category, 0) > price:
                            #         price = -abs(c)
                            #     else:
                            #         price = abs(c)

            return Response(data)

        return Response()
