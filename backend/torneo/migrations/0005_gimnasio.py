# Convierte Peleador.gimnasio (texto libre) en una llave foránea a la nueva tabla Gimnasio,
# conservando los gimnasios que ya estaban escritos: cada nombre distinto pasa a ser una fila de Gimnasio.
import django.db.models.deletion
from django.db import migrations, models


def texto_a_gimnasio(apps, schema_editor):
    Gimnasio = apps.get_model("torneo", "Gimnasio")
    Peleador = apps.get_model("torneo", "Peleador")
    for peleador in Peleador.objects.all():
        nombre = (peleador.gimnasio_texto or "").strip() or "Sin gimnasio"
        gimnasio, _ = Gimnasio.objects.get_or_create(nombre=nombre, defaults={"ciudad": "Por definir"})
        peleador.gimnasio = gimnasio
        peleador.save(update_fields=["gimnasio"])


class Migration(migrations.Migration):

    dependencies = [
        ("torneo", "0004_perfil_cedula"),
    ]

    operations = [
        migrations.CreateModel(
            name="Gimnasio",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nombre", models.CharField(max_length=100, unique=True)),
                ("ciudad", models.CharField(max_length=60)),
            ],
        ),
        migrations.RenameField(model_name="peleador", old_name="gimnasio", new_name="gimnasio_texto"),
        migrations.AddField(
            model_name="peleador",
            name="gimnasio",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT,
                                    related_name="peleadores", to="torneo.gimnasio"),
        ),
        migrations.RunPython(texto_a_gimnasio, migrations.RunPython.noop),
        migrations.RemoveField(model_name="peleador", name="gimnasio_texto"),
        migrations.AlterField(
            model_name="peleador",
            name="gimnasio",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,
                                    related_name="peleadores", to="torneo.gimnasio"),
        ),
    ]
