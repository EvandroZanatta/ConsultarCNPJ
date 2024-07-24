CREATE TABLE public.events (
    id SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) NOT NULL,
    time_ms BIGINT NOT NULL,
    ip INET NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP MATERIALIZED VIEW IF EXISTS public.events_summary;

CREATE MATERIALIZED VIEW public.events_summary AS
SELECT 
    COUNT(DISTINCT(cnpj)) AS cnpjs,
    COUNT(cnpj) as qtde,
    ROUND(AVG(time_ms)) AS avg_time,
	now() as processing_date
FROM 
    public.events;

REFRESH MATERIALIZED VIEW public.events_summary;

SELECT * FROM public.events_summary