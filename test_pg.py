import psycopg2
import sys

passwords = [
    "Chaithanya", "chaithanya", "Chaithanya123", "Chaithanya@123",
    "Postgres", "Postgres123", "Postgres@123", 
    "student@123", "student123",
    "repose", "Repose", "Repose@123"
]

connected = False
for pwd in passwords:
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password=pwd,
            host="127.0.0.1",
            port=5432
        )
        print(f"SUCCESS: Connected using password: '{pwd}'")
        conn.close()
        connected = True
        break
    except Exception as e:
        print(f"FAILED with password '{pwd}': {e}", file=sys.stderr)

if not connected:
    print("FAILED: Could not connect to PostgreSQL with any default passwords.", file=sys.stderr)
