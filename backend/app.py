#!flask/bin/python
import sqlite3
from os.path import join, dirname

from flask import Flask, jsonify
import pandas as pd


app = Flask(__name__)

DATA_DIR = join(dirname(__file__), 'data')
DB_NAME = 'covid_db.sqlite'
DB_PATH = join(DATA_DIR, DB_NAME)
SNAP_DT = '2022-03-30'


@app.route('/')
def index():
    return "Welcome :fire_emoji:"


@app.route('/covid-world-snap', methods=['GET'])
@app.route('/covid-world-snap/<string:country>', methods=['GET'])
def get_world_covid_data_snapshot(country=None):
    """Return the latest worldwide COVID-19 data"""
    conn = sqlite3.connect(DB_PATH)
    query = f"""select location as country_name,
                       date,
                       people_vaccinated_per_hundred,
                       --additional data in case needed
                       new_cases,
                       new_deaths,
                       total_cases
                from covid_world_hist
                where date='{SNAP_DT}'
                and people_vaccinated_per_hundred not null"""
    if country:
        query += f"and location='{country}'"

    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-usa-snap', methods=['GET'])
@app.route('/covid-usa-snap/<string:state>', methods=['GET'])
def get_us_state_covid_data_snapshot(state=None):
    """Return the latest COVID-19 data in U.S."""
    conn = sqlite3.connect(DB_PATH)
    query = """select date,
                      state,
                      people_vaccinated_per_hundred, 
                      --additional data in case needed
                      new_cases,
                      new_deaths,
                      total_cases
                from covid_us_hist
                where date='{snap_dt}'
                and people_vaccinated_per_hundred not null
                {state_filter}
                group by 1, 2
                order by 1, 2
                """.format(snap_dt=SNAP_DT,
                           state_filter=f"and state='{state}'" if state else "")
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-usa-hist-daily', methods=['GET'])
@app.route('/covid-usa-hist-daily/<string:snap_dt>', methods=['GET'])
def get_us_covid_data_daily(snap_dt=None):
    """Return the daily historical COVID-19 data in the U.S."""
    conn = sqlite3.connect(DB_PATH)
    query = """select date,
                       avg(people_vaccinated_per_hundred) as avg_vaccination_rate_pct,
                       --additional data in case needed
                       sum(new_cases) as total_new_cases,
                       sum(new_deaths) as total_new_deaths,
                       sum(total_cases) as total_cases
                from covid_us_hist
                {snap_dt_filter}
                group by 1
                having avg_vaccination_rate_pct not null
                order by 1 desc
                """.format(snap_dt_filter=f"where date='{snap_dt}'" if snap_dt else "")
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-usa-hist-monthly', methods=['GET'])
@app.route('/covid-usa-hist-monthly/<string:snap_ym>', methods=['GET'])
def get_us_covid_data_monthly(snap_ym=None):
    """Return the monthly historical COVID-19 data in the U.S."""
    conn = sqlite3.connect(DB_PATH)
    query = """select substr(date, 1, 7) as year_month,
                       avg(people_vaccinated_per_hundred) as avg_vaccination_rate_pct,
                       --additional data in case needed
                       sum(new_cases) as total_new_cases,
                       sum(new_deaths) as total_new_deaths,
                       sum(total_cases) as total_cases
                from covid_us_hist
                {snap_ym_filter}
                group by 1
                having avg_vaccination_rate_pct not null
                order by 1 desc
                """.format(snap_ym_filter=f"where year_month='{snap_ym}'" if snap_ym else "")
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-usa-snap-age', methods=['GET'])
def get_us_covid_vac_coverage_by_age_group():
    """Return the latest COVID-19 vaccination coverage in the U.S. by age group"""
    conn = sqlite3.connect(DB_PATH)
    query = f"""select date,
                       age_group,
                       Administered_Dose1_pct_US as people_had_does1_per_hundred
                from us_vac_age_snap
                group by 1, 2
                order by 1, 2
                """
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-usa-snap-race', methods=['GET'])
def get_us_covid_vac_coverage_by_race_group():
    """Return the latest COVID-19 vaccination coverage in the U.S. by race group"""
    conn = sqlite3.connect(DB_PATH)
    query = f"""select date,
                       race_group,
                       Administered_Dose1_pct_US as people_had_does1_per_hundred
                from us_vac_race_snap
                group by 1, 2
                order by 1, 2
                """
    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


@app.route('/covid-country-attr-snap', methods=['GET'])
@app.route('/covid-country-attr-snap/<int:top_n>', methods=['GET'])
def get_covid_data_with_country_attr_snapshot(top_n=None):
    """Return the latest worldwide COVID-19 data along with country level of attributes"""
    conn = sqlite3.connect(DB_PATH)
    query = f"""select location as country_name,
                       date,
                       people_vaccinated_per_hundred,
                       new_cases,
                       new_deaths,
                       total_cases,
                       population_density,
                       extreme_poverty,
                       handwashing_facilities
                from covid_world_hist
                where date='{SNAP_DT}'
                and population_density not null
                and people_vaccinated_per_hundred not null
                and country_name <> 'World'
                order by total_cases desc, new_cases desc
                """
    if top_n:
        query += f'limit {top_n}'

    df = pd.read_sql(query, conn)
    conn.close()
    return jsonify(df.to_dict('records'))


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8088)
