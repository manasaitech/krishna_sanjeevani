import pandas as pd
import uuid
import time

excel_path = 'Catlogue of disorders, surawalies and timmings (2).xlsx'
sql_path = 'backend/seed_data.sql'

# Helpers
def clean_string(val):
    if pd.isna(val):
        return ""
    return str(val).strip()

def sql_escape(val):
    return clean_string(val).replace("'", "''")

# 1. Parse Excel data
# Sheet 2: Ailments
df_ailments = pd.read_excel(excel_path, sheet_name='Sheet2', header=3)
df_ailments.columns = ['SrNo', 'Ailment', 'Surawali', 'Time']
df_ailments = df_ailments.dropna(subset=['Ailment'])
df_ailments = df_ailments[df_ailments['Ailment'] != 'Sr. No.']
df_ailments = df_ailments[~df_ailments['Ailment'].astype(str).str.startswith('Standard operating')]
df_ailments = df_ailments[~df_ailments['Ailment'].astype(str).str.startswith('Note')]

# Sheet 3: Pregnancy
df_preg = pd.read_excel(excel_path, sheet_name='Sheet3', header=3)
df_preg.columns = ['Month', 'Surawali', 'Time', 'Music']
df_preg = df_preg.dropna(subset=['Month', 'Surawali'])
df_preg = df_preg[df_preg['Month'] != 'Pregnancy month']
df_preg = df_preg[~df_preg['Month'].astype(str).str.startswith('Standard operating')]
df_preg = df_preg[~df_preg['Month'].astype(str).str.startswith('Note')]

# Sheet 4: Corporate
df_corp = pd.read_excel(excel_path, sheet_name='Sheet4', header=3)
df_corp.columns = ['SrNo', 'Raga', 'Day', 'Time']
df_corp = df_corp.dropna(subset=['Raga'])
df_corp = df_corp[df_corp['Raga'] != 'sr. no']
df_corp = df_corp[~df_corp['Raga'].astype(str).str.startswith('Standard operating')]
df_corp = df_corp[~df_corp['Raga'].astype(str).str.startswith('Note')]

# Extract unique items to populate master tables
unique_ailments = sorted(list(set(df_ailments['Ailment'].apply(clean_string))))
unique_surawalis = sorted(list(set(
    df_ailments['Surawali'].apply(clean_string).tolist() + 
    df_preg['Surawali'].apply(clean_string).tolist()
)))
# Collect all timings
all_timings_raw = (
    df_ailments['Time'].apply(clean_string).tolist() + 
    df_preg['Time'].apply(clean_string).tolist() + 
    df_corp['Time'].apply(clean_string).tolist()
)
unique_timings = sorted(list(set([t for t in all_timings_raw if t])))

# Generate UUID mappings
ailment_ids = {name: f"ail_{uuid.uuid5(uuid.NAMESPACE_DNS, name)}" for name in unique_ailments}
surawali_ids = {name: f"sur_{uuid.uuid5(uuid.NAMESPACE_DNS, name)}" for name in unique_surawalis}
timing_ids = {name: f"tim_{uuid.uuid5(uuid.NAMESPACE_DNS, name)}" for name in unique_timings}

now = int(time.time() * 1000)

sql_statements = []

# Reset tables
sql_statements.append("DELETE FROM corporate_ragas;")
sql_statements.append("DELETE FROM pregnancy_mappings;")
sql_statements.append("DELETE FROM ailment_surawalis;")
sql_statements.append("DELETE FROM timings;")
sql_statements.append("DELETE FROM surawalis;")
sql_statements.append("DELETE FROM ailments;")

# Populate Ailments
for name in unique_ailments:
    uid = ailment_ids[name]
    esc_name = sql_escape(name)
    sql_statements.append(f"INSERT INTO ailments (id, name, created_at, updated_at) VALUES ('{uid}', '{esc_name}', {now}, {now});")

# Populate Surawalis
for name in unique_surawalis:
    uid = surawali_ids[name]
    esc_name = sql_escape(name)
    sql_statements.append(f"INSERT INTO surawalis (id, name, created_at, updated_at) VALUES ('{uid}', '{esc_name}', {now}, {now});")

# Populate Timings
for name in unique_timings:
    uid = timing_ids[name]
    esc_name = sql_escape(name)
    sql_statements.append(f"INSERT INTO timings (id, name, created_at, updated_at) VALUES ('{uid}', '{esc_name}', {now}, {now});")

# Populate Ailment-Surawali mappings (Sheet 2)
for idx, row in df_ailments.iterrows():
    a_name = clean_string(row['Ailment'])
    s_name = clean_string(row['Surawali'])
    t_name = clean_string(row['Time'])
    
    a_id = ailment_ids[a_name]
    s_id = surawali_ids[s_name]
    t_id = timing_ids[t_name] if t_name else timing_ids.get("any time", "any_time_fallback")
    
    mapping_id = f"asm_{uuid.uuid4()}"
    sql_statements.append(f"INSERT INTO ailment_surawalis (id, ailment_id, surawali_id, timing_id, created_at) VALUES ('{mapping_id}', '{a_id}', '{s_id}', '{t_id}', {now});")

# Populate Pregnancy mappings (Sheet 3)
for idx, row in df_preg.iterrows():
    month = int(row['Month'])
    s_name = clean_string(row['Surawali'])
    t_name = clean_string(row['Time'])
    music = sql_escape(row['Music'])
    
    s_id = surawali_ids[s_name]
    t_id = timing_ids[t_name]
    
    mapping_id = f"pm_{uuid.uuid4()}"
    sql_statements.append(f"INSERT INTO pregnancy_mappings (id, pregnancy_month, surawali_id, timing_id, music_track, created_at) VALUES ('{mapping_id}', {month}, '{s_id}', '{t_id}', '{music}', {now});")

# Populate Corporate mappings (Sheet 4)
for idx, row in df_corp.iterrows():
    raga = sql_escape(row['Raga'])
    day = sql_escape(row['Day'])
    t_name = clean_string(row['Time'])
    
    t_id = timing_ids[t_name]
    
    mapping_id = f"cr_{uuid.uuid4()}"
    sql_statements.append(f"INSERT INTO corporate_ragas (id, raga_name, week_day, timing_id, created_at) VALUES ('{mapping_id}', '{raga}', '{day}', '{t_id}', {now});")

# Write to file
with open(sql_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements) + "\n")

print(f"Generated seed SQL file with {len(sql_statements)} statements.")
