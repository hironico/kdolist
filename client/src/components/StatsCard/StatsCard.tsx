import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import { apiBaseUrl } from '@/config';
import { iOSBoxShadow } from '@/theme/muios';

interface Stats {
    users: number;
    gifts: number;
    links: number;
    images: number;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    loading: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
    boxShadow: iOSBoxShadow,
    height: '100%',
}));

const StatBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    minHeight: '120px',
}));

const IconWrapper = styled(Box)<{ color: string }>(({ color }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: color,
    color: 'white',
}));

const AnimatedNumber: React.FC<{ value: number; duration?: number }> = ({
    value,
    duration = 2000
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(easeOutQuart * value);

            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [value, duration]);

    return <>{displayValue.toLocaleString()}</>;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, loading }) => {
    return (
        <StyledCard>
            <CardContent>
                <StatBox>
                    {loading ? (
                        <>
                            <Skeleton variant="circular" width={48} height={48} />
                            <Skeleton variant="text" width={60} height={40} />
                            <Skeleton variant="text" width={80} height={20} />
                        </>
                    ) : (
                        <>
                            <IconWrapper color={color}>
                                {icon}
                            </IconWrapper>
                            <Typography variant="h4" component="div" fontWeight="bold">
                                <AnimatedNumber value={value} />
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center">
                                {label}
                            </Typography>
                        </>
                    )}
                </StatBox>
            </CardContent>
        </StyledCard>
    );
};

const StatsCard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/stats`);

                if (!response.ok) {
                    throw new Error('Failed to fetch statistics');
                }

                const data: Stats = await response.json();
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (error) {
        return null; // Silently fail - don't show error on welcome page
    }

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                        icon={<PeopleIcon />}
                        label="Utilisateurs"
                        value={stats?.users || 0}
                        color="#1976d2"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                        icon={<CardGiftcardIcon />}
                        label="Cadeaux"
                        value={stats?.gifts || 0}
                        color="#2e7d32"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                        icon={<LinkIcon />}
                        label="Liens"
                        value={stats?.links || 0}
                        color="#ed6c02"
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                        icon={<ImageIcon />}
                        label="Images"
                        value={stats?.images || 0}
                        color="#9c27b0"
                        loading={loading}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatsCard;
