import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'django_%' AND name NOT LIKE 'auth_%' AND name NOT LIKE 'sqlite_%'")
tables = cursor.fetchall()

print('\n=== Your Application Tables ===\n')
for table in tables:
    table_name = table[0]
    print(f'📋 {table_name}')
    
    # Get column info
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    
    for col in columns:
        col_name = col[1]
        col_type = col[2]
        is_nullable = "NULL" if col[3] == 0 else "NOT NULL"
        is_pk = " (PRIMARY KEY)" if col[5] == 1 else ""
        print(f'   - {col_name}: {col_type} {is_nullable}{is_pk}')
    
    # Get row count
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    print(f'   📊 Total rows: {count}\n')

conn.close()
