
-- Таблица заявок о доступности городской среды
CREATE TABLE t_p32278697_solar_energy_initiat.reports (
    id SERIAL PRIMARY KEY,
    
    -- Геолокация
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Анапа',
    
    -- Тип локации
    location_type VARCHAR(50) NOT NULL,
    -- easy | hard | blocked | historic | park
    
    -- Особенности (массив строк)
    features TEXT[] DEFAULT '{}',
    
    -- Комментарий
    comment TEXT,
    
    -- Фото (URL из S3)
    photo_url TEXT,
    photo_metadata JSONB DEFAULT '{}',
    -- {coordinates, timestamp, ...}
    
    -- Статус модерации
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    -- new | approved | rejected
    
    -- Данные отправителя
    submitter_name VARCHAR(200),
    submitter_contact VARCHAR(200),
    
    -- Транспорт (будущее поле)
    transport_type VARCHAR(50),
    -- wheelchair | walking | car | taxi
    
    -- Служебные поля
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(200),
    reject_reason TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX idx_reports_status ON t_p32278697_solar_energy_initiat.reports(status);
CREATE INDEX idx_reports_location_type ON t_p32278697_solar_energy_initiat.reports(location_type);
CREATE INDEX idx_reports_city ON t_p32278697_solar_energy_initiat.reports(city);
CREATE INDEX idx_reports_coords ON t_p32278697_solar_energy_initiat.reports(latitude, longitude);
CREATE INDEX idx_reports_created_at ON t_p32278697_solar_energy_initiat.reports(created_at DESC);
