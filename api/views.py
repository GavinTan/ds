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
        weekday = [1, 2, 3, 4, 5, 6, 7]
        data = {}
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.is_active:
                if datetime.now().isoweekday() in weekday:
                    update_last_login(None, user)
                    refresh = RefreshToken.for_user(user)
                    data['token'] = str(refresh.access_token)
                    data['status'] = 'ok'
                else:
                    data['status'] = 'error'
                    data['error'] = '周末不允许登录系统！'
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
            categories = queryset.values_list('categories', flat=True)
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
        a = self.request.query_params.get('a')
        c = self.request.query_params.get('c', '')
        qd = self.request.query_params.get('qd')
        uid = self.request.query_params.get('uid')

        queryset = self.get_queryset().filter(user_id=uid)

        user = User.objects.filter(id=uid).first()
        if user:
            if user.is_superuser:
                queryset = self.get_queryset()
        if qd:
            queryset = queryset.filter(date=qd)


        # serializer = self.serializer_class(queryset, many=True)
        self.queryset = queryset
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
        data.pop('id')
        for i, e in enumerate(categories):
            price = e.get('price')
            if price:
                data['category'] = e.get(f'category{i + 1}')
                data['price'] = price
                data['user_id'] = user
                InputPriceRecord.objects.update_or_create(date=data.get('date'), category=e.get(f'category{i + 1}'),
                                                          defaults=data.copy())
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

            queryset = self.get_queryset().filter(user_id=uid).order_by('date')
            for i in queryset:
                if i.date not in data['x_data']:
                    data['x_data'].append(i.date)

                for index, e in enumerate(i.categories):
                    category = e.get(f'category{index + 1}')
                    price = e.get('price')

                    if price is None:
                        record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by('-date').first()
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

            queryset = self.get_queryset().filter(user_id=uid).order_by('date')
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
                                record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by('-date').first()
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

            queryset = self.get_queryset().filter(user_id=uid).order_by('date')
            for i in queryset:
                minuend_name = ''
                n = 0
                for index, e in enumerate(i.categories):
                    category = e.get(f'category{index + 1}')
                    price = e.get('price')
                    if price is None:
                        record = InputPriceRecord.objects.filter(category=category, user_id=uid).order_by('-date').first()
                        if record:
                            price = record.price

                    if isinstance(price, str) and price.isdigit():
                        price = int(price)

                    if 'category1' in e:
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

                if i.date not in data['x_data']:
                    data['x_data'].append(i.date)

            variety_queryset = Variety.objects.all().filter(user_id=uid).order_by('create_time')[:4]
            for i in queryset:
                subtrahend = []
                if i.variety in variety_queryset:
                    for v_index, v in enumerate(variety_queryset):
                        if v_index != 0:
                            q = queryset.filter(date=i.date, variety=v).first()
                            if list(variety_queryset).index(i.variety) == 0:
                                subtrahend.append(q)
                            if list(variety_queryset).index(i.variety) == 1 and v_index != 1:
                                subtrahend.append(q)
                            if list(variety_queryset).index(i.variety) == 2 and v_index == 3:
                                subtrahend.append(q)
                    if list(variety_queryset).index(i.variety) == 3:
                        continue

                    for category in i.categories:
                        key_list = ['category1', 'category2']
                        for key in key_list:
                            if key in category:
                                price = category.get('price')
                                if price is None:
                                    record = InputPriceRecord.objects.filter(category=category.get(key), user_id=uid).order_by(
                                        '-date').first()
                                    if record:
                                        price = record.price

                                if isinstance(price, str) and price.isdigit():
                                    price = int(price)

                                minuend = price
                                for s in subtrahend:
                                    if s:
                                        for s_category in s.categories:
                                            if key in s_category:
                                                price = s_category.get('price')
                                                if price is None:
                                                    record = InputPriceRecord.objects.filter(
                                                        category=s_category.get(key), user_id=uid).order_by('-date').first()
                                                    if record:
                                                        price = record.price

                                                if isinstance(price, str) and price.isdigit():
                                                    price = int(price)

                                                name = f"{i.variety.name}（{category.get(key)}-{s_category.get(key)}）"

                                                if name not in data['legend_data']:
                                                    series = {'type': 'line', 'showSymbol': False, 'name': name, 'data': [minuend - price]}
                                                    data['series_data'].append(series)
                                                    data['legend_data'].append(name)

                                                else:
                                                    for series in data['series_data']:
                                                        if series.get('name') == name:
                                                            series.get('data').append(minuend - price)
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
                        record = InputPriceRecord.objects.filter(category=category, date_range=date_range, user_id=uid).order_by('-date').first()
                        if record:
                            price = record.price

                    if isinstance(price, str) and price.isdigit():
                        price = int(price)

                    for c in select_category:
                        for k, v in c.items():
                            if category == v:
                                if i.date == parse_datetime(select_date).date():
                                    if select_category.index({k: v}) == 0:
                                        n['z'] = price
                                    if select_category.index({k: v}) == 1:
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
            series2 = {'type': 'line', 'showSymbol': False, 'name': f"{select_category[0]['category1']}+V", 'data': []}
            if len(data['series_data']) == 2:
                for x in data['series_data'][1]['data']:
                    v = n['z'] - n['x']
                    series2['data'].append(x + v)
                    series1['data'].append(v)

                data['legend_data'].append(f"{select_category[0]['category1']}+V")
                data['legend_data'].append('V')
                data['series_data'].append(series1)
                data['series_data'].append(series2)

            return Response(data)

        if a == 'get_chart5_data':
            data = {
                'x_data': [],
                'legend_data': [],
                'series_data': []
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
                        record = InputPriceRecord.objects.filter(category=e.get(f'category{index + 1}'), date_range=date_range, user_id=uid).order_by(
                            '-date').first()
                        if record:
                            price = record.price

                    if isinstance(price, str) and price.isdigit():
                        price = int(price)

                    for category in [item[key] for item in select_category for key in item]:
                        if category == e.get(f'category{index + 1}'):
                            if i.date not in data['x_data']:
                                data['x_data'].append(i.date)

                            if category not in data['legend_data']:
                                series = {'type': 'line', 'showSymbol': False, 'name': category, 'data': [price]}
                                data['series_data'].append(series)
                                data['legend_data'].append(category)
                            if i.date == parse_datetime(select_date).date():
                                n[category] = price
                            else:
                                c = n.get(category, 0) - price
                                if n.get(category, 0) > price:
                                    price = -abs(c)
                                else:
                                    price = abs(c)

                                for series in data['series_data']:
                                    if series.get('name') == category:
                                        series.get('data').append(price)
            return Response(data)

        return Response()
