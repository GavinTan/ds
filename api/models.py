from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    name = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=11, blank=True)
    address = models.CharField(max_length=200, blank=True)
    role = models.JSONField(default=list)
    avatar = models.URLField(default='https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png')

    # 登录使用字段
    USERNAME_FIELD = 'username'
    # 通过 createsuperuser 命令行时候必填字段
    REQUIRED_FIELDS = ['name']

    class Meta:
        verbose_name = '用户列表'
        db_table = 'auth_user'


class Variety(models.Model):
    name = models.CharField('品种名称', max_length=20)
    categories = models.JSONField('类别列表', default=list)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    update_time = models.DateTimeField('更新时间', auto_now=True)
    create_time = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '种类列表'


class PriceData(models.Model):
    variety = models.ForeignKey(Variety, on_delete=models.CASCADE, verbose_name='种类')
    categories = models.JSONField('类别列表',  default=list)
    date = models.DateField('日期', blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    update_time = models.DateTimeField('更新时间', auto_now=True)
    create_time = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '价格数据'


class InputPriceRecord(models.Model):
    variety = models.ForeignKey(Variety, on_delete=models.CASCADE, verbose_name='种类')
    category = models.CharField('类别', max_length=20)
    price = models.CharField('价格', max_length=20)
    date = models.DateField('日期')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    update_time = models.DateTimeField('更新时间', auto_now=True)
    create_time = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '录入价格记录'

