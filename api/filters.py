from .models import *
import django_filters


class UserFilter(django_filters.FilterSet):

    class Meta:
        model = User
        fields = ['username', 'name', 'is_active']


class PriceDataFilter(django_filters.FilterSet):

    class Meta:
        model = PriceData
        fields = ['variety', 'date']


class VarietyFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    categories = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Variety
        fields = ['name', 'categories']
