from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = user.id
        # ...

        return token


class UserSerializer(serializers.ModelSerializer):
    # access = serializers.SerializerMethodField()
    password = serializers.CharField(required=False)

    class Meta:
        model = get_user_model()
        exclude = ['is_staff', 'last_name', 'first_name', 'user_permissions', 'groups']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_superuser:
            representation['role'] = representation['role'] + ['admin']
        return representation

    def to_internal_value(self, data):
        raw_password = data.get('password')
        if raw_password == '*' * 10:
            data.pop('password')
        else:
            data['password'] = make_password(raw_password)
        return super().to_internal_value(data)


class VarietySerializer(serializers.ModelSerializer):

    class Meta:
        model = Variety
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user'] = instance.user.name
        return representation


class PriceDataSerializer(serializers.ModelSerializer):

    class Meta:
        model = PriceData
        fields = '__all__'

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['user'] = instance.user.name
        representation['variety'] = instance.variety.name
        representation['variety_id'] = instance.variety.id
        return representation

    def to_internal_value(self, data):
        data['variety'] = data.pop('variety_id')
        return super().to_internal_value(data)


class InputPriceRecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = InputPriceRecord
        fields = '__all__'
