"""
Script para detectar el formato real de un archivo de audio.
Útil cuando la extensión (.mpeg, .mpg, etc.) no coincide con el contenedor/códec real.

Uso:
    python detectar_formato.py "ruta/al/archivo.mpeg"
    py detectar_formato.py "C:\Users\Ar\Downloads\WhatsApp Audio 2026-02-15 at 3.44.19 AM.mpeg"
"""
import os
import sys
import av


def detectar_formato(ruta: str) -> None:
    if not os.path.exists(ruta):
        print(f"Error: No existe el archivo: {ruta}")
        sys.exit(1)

    print(f"Archivo: {ruta}")
    print(f"Extensión: {os.path.splitext(ruta)[1]}")
    print("-" * 50)

    try:
        with av.open(ruta) as container:
            print(f"Contenedor (formato real): {container.format.name}")
            print(f"  Long name: {container.format.long_name}")
            print(f"  Extensions: {container.format.extensions}")

            if not container.streams.audio:
                print("  No se encontró stream de audio.")
                return

            for i, stream in enumerate(container.streams.audio):
                print(f"\nStream de audio #{i}:")
                print(f"  Códec: {stream.codec_context.name}")
                print(f"  Sample rate: {stream.codec_context.sample_rate} Hz")
                print(f"  Canales: {stream.codec_context.channels}")
                print(f"  Duración (aprox): {float(stream.duration * stream.time_base):.2f} s")

        print("-" * 50)
        print("Conclusión: La extensión del archivo puede no coincidir con el")
        print("contenedor real. Por eso la app convierte .mpeg/.mpg a WAV antes de transcribir.")

    except av.AVError as e:
        print(f"Error al abrir con PyAV: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    detectar_formato(sys.argv[1])
