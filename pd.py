import pandas as pd




def mostrar_asanas_por_series():
    # Cargar el archivo
    df = pd.read_csv('asana.csv')
    
    # Limpiar YogaSeries (convertir NaN a string vacío)
    df['YogaSeries'] = df['YogaSeries'].fillna('').astype(str)
    
    # Asignar ID único a cada asana
    df['ID'] = range(1, len(df) + 1)
    
    # Guardar archivo con IDs
    df.to_csv('asana_id.csv', index=False)
    print("✅ Archivo 'asana_id.csv' creado con IDs únicos")
    
    # Mostrar asanas agrupadas por Yoga Series
    print("\n=== ASANAS POR YOGA SERIES ===\n")
    
    # Obtener series únicas (excluyendo vacías)
    series_unicas = [serie for serie in df['YogaSeries'].unique() if serie != '']
    
    for serie in sorted(series_unicas):
        asanas_serie = df[df['YogaSeries'] == serie].sort_values('ID')
        
        print(f"🧘 {serie} ({len(asanas_serie)} asanas):")
        for _, asana in asanas_serie.iterrows():
            print(f"   ID {asana['ID']:3d} | {asana['Name']}")
        print()
    
    # Mostrar asanas sin Yoga Series
    asanas_sin_serie = df[df['YogaSeries'] == '']
    if len(asanas_sin_serie) > 0:
        print("=== ASANAS SIN YOGA SERIES ===")
        for _, asana in asanas_sin_serie.sort_values('ID').iterrows():
            print(f"   ID {asana['ID']:3d} | {asana['Name']}")
        print()

# Ejecutar
if __name__ == "__main__":
    mostrar_asanas_por_series()


def generar_listas_ids_formato():
    # Cargar el archivo
    df = pd.read_csv('asana.csv')
    
    # Limpiar YogaSeries
    df['YogaSeries'] = df['YogaSeries'].fillna('').astype(str)
    
    # Asignar ID único a cada asana
    df['ID'] = range(1, len(df) + 1)
    
    # Guardar archivo con IDs
    df.to_csv('asana_id.csv', index=False)
    
    # Generar listas en el formato solicitado
    print("=== LISTAS DE IDs ===\n")
    
    series_unicas = [serie for serie in df['YogaSeries'].unique() if serie != '']
    
    for serie in sorted(series_unicas):
        ids_serie = sorted(df[df['YogaSeries'] == serie]['ID'].tolist())
        nombre_variable = ''.join(c for c in serie if c.isalnum())
        print(f"{nombre_variable} = {ids_serie}")
    
    # Asanas sin serie
    ids_sin_serie = sorted(df[df['YogaSeries'] == '']['ID'].tolist())
    if ids_sin_serie:
        print(f"sin_serie = {ids_sin_serie}")

# Ejecutar
generar_listas_ids_formato()


import pandas as pd

def actualizar_series_ordenadas():
    # Cargar el archivo
    df = pd.read_csv('asana_id.csv')
    
    # Definir el orden de las series según tu especificación
    series_orden = {
        'ādhāra': [112, 130, 131, 90, 94, 161, 93, 160, 105, 106, 107, 108],
        'yogacikitsā': [98, 157, 158, 159, 9, 153, 71, 169, 170, 37, 101, 102, 110, 8, 137, 59, 60, 61, 73, 74, 75, 76, 87, 32, 69, 124, 53, 68, 18, 19, 141, 142, 123, 126, 127, 140, 148, 115],
        'nāḍī śodhana': [99, 67, 116, 117, 28, 38, 97, 151, 70, 62, 63, 129, 22, 23, 26, 11, 48, 43, 178, 134, 135, 136, 103, 64, 79, 84, 166, 92, 55, 56, 179, 180, 81, 82, 83, 15, 16, 17],
        'tṛtīya śreṇī': [2, 14, 25, 34, 39, 40, 41, 42, 44, 45, 46, 47, 49, 50, 51, 52, 58, 66, 85, 86, 109, 111, 121, 128, 144, 145, 146, 147, 162, 165, 168, 172, 173, 174, 175],
        'pṛṣṭhavakrāsana': [143, 138, 139, 167, 100],
        'samāpana': [113, 57, 65, 150, 104, 78, 155, 119, 20, 177, 154, 114]
    }
    
    # Crear mapeo de ID a Sandhi para todas las asanas
    id_to_sandhi = dict(zip(df['ID'], df['Sandhi']))
    id_to_name = dict(zip(df['ID'], df['Name']))
    
    print("=== VERIFICANDO ASANAS EN CADA SERIE ===")
    
    # Verificar que todos los IDs existen
    for serie_name, ids in series_orden.items():
        ids_faltantes = [id for id in ids if id not in id_to_sandhi]
        if ids_faltantes:
            print(f"⚠️  IDs faltantes en {serie_name}: {ids_faltantes}")
        else:
            print(f"✅ {serie_name}: {len(ids)} asanas encontradas")
    
    print("\n=== ACTUALIZANDO DATOS ===")
    
    # Resetear Before/After y YogaSeries para todas las asanas primero
    df['Before'] = ''
    df['After'] = ''
    df['YogaSeries'] = ''
    df['Ashtanga'] = ''
    
    # Procesar cada serie en el orden especificado
    for serie_name, ids in series_orden.items():
        print(f"\n📋 Procesando: {serie_name}")
        
        for i, asana_id in enumerate(ids):
            if asana_id not in id_to_sandhi:
                print(f"   ⚠️  ID {asana_id} no encontrado, saltando...")
                continue
            
            # Obtener Sandhi de la asana actual, anterior y siguiente
            sandhi_actual = id_to_sandhi[asana_id]
            sandhi_anterior = id_to_sandhi[ids[i-1]] if i > 0 else ''
            sandhi_siguiente = id_to_sandhi[ids[i+1]] if i < len(ids)-1 else ''
            
            # Actualizar la fila correspondiente
            mask = df['ID'] == asana_id
            df.loc[mask, 'YogaSeries'] = serie_name
            df.loc[mask, 'Before'] = sandhi_anterior
            df.loc[mask, 'After'] = sandhi_siguiente
            df.loc[mask, 'Ashtanga'] = 'x'
            
            print(f"   ✅ {id_to_name[asana_id]} (ID: {asana_id})")
            print(f"      Before: '{sandhi_anterior}' | After: '{sandhi_siguiente}'")
    
    # Guardar el archivo actualizado
    df.to_csv('asanas_actualizado.csv', index=False)
    print(f"\n🎉 Archivo 'asanas_actualizado.csv' guardado exitosamente!")
    print(f"📊 Total asanas procesadas en series: {sum(len(ids) for ids in series_orden.values())}")
    
    return df

# Ejecutar
if __name__ == "__main__":
    df_actualizado = actualizar_series_ordenadas()