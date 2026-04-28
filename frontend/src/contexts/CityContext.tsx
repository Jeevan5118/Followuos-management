import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface City {
    id: string;
    name: string;
}

interface CityContextType {
    cities: City[];
    activeCityId: string | null;
    setActiveCityId: (id: string) => void;
    fetchCities: () => Promise<void>;
    isLoading: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cities, setCities] = useState<City[]>([]);
    const [activeCityId, setActiveCityIdState] = useState<string | null>(localStorage.getItem('activeCityId'));
    const [isLoading, setIsLoading] = useState(true);

    const fetchCities = async () => {
        try {
            const res = await api.get('/cities');
            const fetchedCities = res.data as City[];
            setCities(fetchedCities);

            if (fetchedCities.length > 0 && !activeCityId) {
                setActiveCityId(fetchedCities[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch cities", error);
        } finally {
            setIsLoading(false);
        }
    };

    const setActiveCityId = (id: string) => {
        setActiveCityIdState(id);
        localStorage.setItem('activeCityId', id);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            if (api.defaults.headers) {
                (api.defaults.headers as any).Authorization = `Bearer ${token}`;
            }
            fetchCities();
        } else {
            setIsLoading(false);
        }
    }, []);

    return (
        <CityContext.Provider value={{ cities, activeCityId, setActiveCityId, fetchCities, isLoading }}>
            {children}
        </CityContext.Provider>
    );
};

export const useCity = () => {
    const context = useContext(CityContext);
    if (context === undefined) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
};
