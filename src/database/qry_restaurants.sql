-- SELECT * FROM public.open_restaurants

SELECT cuisine, restaurant, address, zip
FROM open_restaurants
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(-122.4351642,37.76267831),4326)
LIMIT 10