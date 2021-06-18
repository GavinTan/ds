from .models import *
import django_filters


class UserFilter(django_filters.FilterSet):

    class Meta:
        model = User
        fields = ['username', 'name', 'is_active']


class PriceDataFilter(django_filters.FilterSet):
    categories = django_filters.CharFilter(lookup_expr='icontains')
    user = django_filters.CharFilter(field_name='user__name')
    variety = django_filters.CharFilter(field_name='variety__name')

    class Meta:
        model = PriceData
        fields = ['variety', 'date', 'categories', 'user']


class VarietyFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    categories = django_filters.CharFilter(lookup_expr='icontains')
    user = django_filters.CharFilter(field_name='user__name')

    class Meta:
        model = Variety
        fields = ['name', 'categories', 'user']
