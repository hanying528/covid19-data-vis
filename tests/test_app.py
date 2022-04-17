import numpy as np
import pandas as pd

import pytest


def test_index(client):
    response = client.get('/')
    assert b'Welcome :fire_emoji:' == response.data


def test_get_world_covid_data_snapshot(client):
    response = pd.DataFrame(client.get('/covid-world-snap').json)
    exp_col_names = ['country_name', 'date', 'new_cases', 'new_deaths',
                     'people_vaccinated_per_hundred', 'total_cases']

    assert response.columns.tolist() == exp_col_names
    assert set(response['date'].unique()) == {'2022-03-29'}
    assert sorted(response['country_name'].unique()) == ['Canada', 'Mexico', 'United States']
    assert response['people_vaccinated_per_hundred'].isnull().sum() == 0


@pytest.mark.parametrize('country', ['Canada', 'Mexico', 'United States'])
def test_get_world_covid_data_snapshot_by_country(country, client):
    response = pd.DataFrame(client.get(f'/covid-world-snap/{country}').json)
    exp_col_names = ['country_name', 'date', 'new_cases', 'new_deaths',
                     'people_vaccinated_per_hundred', 'total_cases']

    assert response.columns.tolist() == exp_col_names
    assert set(response['date'].unique()) == {'2022-03-29'}
    assert set(response['country_name'].unique()) == {country}
    assert response['people_vaccinated_per_hundred'].isnull().sum() == 0


def test_get_us_state_covid_data_snapshot(client):
    response = pd.DataFrame(client.get('/covid-usa-snap').json)
    exp_col_names = ['date', 'new_cases', 'new_deaths',
                     'people_vaccinated_per_hundred', 'state', 'total_cases']

    assert response.columns.tolist() == exp_col_names
    assert set(response['date'].unique()) == {'2022-03-30'}
    assert response['people_vaccinated_per_hundred'].isnull().sum() == 0


def test_get_us_state_covid_data_snapshot_by_state(client):
    response = client.get('/covid-usa-snap/VA').json
    assert response == [{'date': '2022-03-30', 'new_cases': 816, 'new_deaths': 18,
                         'people_vaccinated_per_hundred': 85.0, 'state': 'VA', 'total_cases': 1668904}]


def test_get_us_state_covid_data_snapshot_by_state_returns_empty_if_state_nonexists(client):
    response = client.get('/covid-usa-snap/Toronto').json
    assert response == []


def test_get_us_covid_data_daily(client):
    response = pd.DataFrame(client.get('/covid-usa-hist-daily').json)
    exp_col_names = ['avg_vaccination_rate_pct', 'date', 'total_cases',
                     'total_new_cases', 'total_new_deaths']

    assert response.columns.tolist() == exp_col_names
    assert response.date.min() == '2022-02-01'
    assert response.date.max() == '2022-03-30'


def test_get_us_covid_data_daily_by_snap_dt(client):
    response = client.get('/covid-usa-hist-daily/2022-02-15').json

    assert response == [{'avg_vaccination_rate_pct': 75.76140350877192, 'date': '2022-02-15',
                         'total_cases': 75750094, 'total_new_cases': 108291, 'total_new_deaths': 2964}]


def test_get_us_covid_data_monthly(client):
    response = pd.DataFrame(client.get('/covid-usa-hist-monthly').json)
    exp_col_names = ['avg_vaccination_rate_pct', 'total_cases', 'total_new_cases',
                     'total_new_deaths', 'year_month']

    assert response.columns.tolist() == exp_col_names
    assert response['year_month'].unique().tolist() == ['2022-03', '2022-02']


def test_get_us_covid_data_monthly_by_yyyymm(client):
    response = client.get('/covid-usa-hist-monthly/2022-02').json

    assert response == [{'avg_vaccination_rate_pct': 75.70922208281051, 'total_cases': 2112260304,
                         'total_new_cases': 3694018, 'total_new_deaths': 60133, 'year_month': '2022-02'}]


def test_get_us_covid_vac_coverage_by_age_group(client):
    response = pd.DataFrame(client.get('/covid-usa-snap-age').json)

    assert response.columns.tolist() == ['age_group', 'date', 'people_had_does1_per_hundred']
    assert set(response['date'].unique()) == {'2022-03-31'}
    assert np.isclose(response['people_had_does1_per_hundred'].sum(), 100, atol=1e-5)


def test_get_us_covid_vac_coverage_by_race_group(client):
    response = pd.DataFrame(client.get('/covid-usa-snap-race').json)

    assert response.columns.tolist() == ['date', 'people_had_does1_per_hundred', 'race_group']
    assert set(response['date'].unique()) == {'2022-03-31'}
    assert np.isclose(response['people_had_does1_per_hundred'].sum(), 100, atol=1e-5)


def test_get_covid_data_with_country_attr_snapshot(client):
    response = pd.DataFrame(client.get('/covid-country-attr-snap').json)

    assert response.columns.tolist() == ['country_name', 'date', 'extreme_poverty',
                                         'handwashing_facilities', 'new_cases', 'new_deaths',
                                         'people_vaccinated_per_hundred',
                                         'population_density','total_cases']

    assert set(response['date'].unique()) == {'2022-03-29'}
    assert sorted(response['country_name'].unique()) == ['Canada', 'Mexico', 'United States']
    assert response['people_vaccinated_per_hundred'].isnull().sum() == 0


def test_get_covid_data_with_country_attr_snapshot_top_n(client):
    response = client.get('/covid-country-attr-snap/1').json
    assert response == [{'country_name': 'United States', 'date': '2022-03-29',
                         'extreme_poverty': 1.2, 'handwashing_facilities': None,
                         'new_cases': 23643.0, 'new_deaths': 961.0,
                         'people_vaccinated_per_hundred': 76.93,
                         'population_density': 35.608, 'total_cases': 80019128.0}]
