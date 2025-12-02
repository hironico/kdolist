import React from 'react';
import { List, Typography, Box } from '@mui/material';
import TribeListItem from './TribeListItem';
import { EmptyStateCard } from '../EmptyStateCard';
import { SentimentDissatisfied } from '@mui/icons-material';
import { Group } from './types';

interface TribeListProps {
    tribes: Group[];
    currentUserId?: string;
    onAcceptInvite?: (membershipId: string) => void;
    onRejectInvite?: (membershipId: string) => void;
    onLeaveTribe?: (groupId: string) => void;
    onInviteUser: (groupId: string) => void;
    onDeleteTribe?: (groupId: string) => void;
    onViewDetails?: (groupId: string) => void;
}

/**
 * TribeList component that displays tribes separated into invitations and joined tribes.
 * Uses SwipeableListItem for each tribe with appropriate actions.
 */
const TribeList: React.FC<TribeListProps> = ({
    tribes,
    currentUserId,
    onAcceptInvite,
    onRejectInvite,
    onLeaveTribe,
    onInviteUser,
    onDeleteTribe,
    onViewDetails,
}) => {
    // Separate invited and joined tribes
    const invitedTribes = tribes.filter(
        (tribe) => tribe.groupMemberships?.[0]?.status === 'INVITED'
    );
    const joinedTribes = tribes.filter(
        (tribe) => (tribe.groupMemberships?.[0]?.status === 'MEMBER')
    );
    const adminTribes = tribes.filter(
        (tribe) => (tribe.groupMemberships?.[0]?.status === 'ADMIN' && tribe.adminId !== currentUserId)
    );
    const ownedTribes = tribes.filter(
        (tribe) => tribe.adminId === currentUserId
    );

    return (
        <Box width="100%" p={2} marginRight="15px">
            {/* Invitations Section */}
            {invitedTribes.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, px: 2 }}>
                        Invitations reçues
                    </Typography>
                    <List sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
                        {invitedTribes.map((tribe) => (
                            <TribeListItem
                                key={`invited-${tribe.id}`}
                                tribe={tribe}
                                currentUserId={currentUserId}
                                onAcceptInvite={onAcceptInvite}
                                onRejectInvite={onRejectInvite}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </List>
                </>
            )}

            {/* admn tribes Section */}
            {ownedTribes.length > 0 && (
                <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, px: 2 }}>
                        Mes tribus
                    </Typography>
                    <List sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
                        {ownedTribes.map((tribe) => (
                            <TribeListItem
                                key={`owned-${tribe.id}`}
                                tribe={tribe}
                                currentUserId={currentUserId}
                                onViewDetails={onViewDetails}
                                onInviteUser={onInviteUser}
                                onDeleteTribe={onDeleteTribe}
                            />
                        ))}
                    </List>
                </>
            )}

            {/* Joined Tribes Section */}
            {(joinedTribes.length > 0 || adminTribes.length > 0) && (
                <>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, px: 2 }}>
                        Tribus dont je suis membre
                    </Typography>
                    <List sx={{ m: '0px', mt: '10px', overflowY: 'auto', alignSelf: 'start' }}>
                        {adminTribes.map((tribe) => (
                            <TribeListItem
                                key={`joined-${tribe.id}`}
                                tribe={tribe}
                                currentUserId={currentUserId}
                                onLeaveTribe={onLeaveTribe}
                                onInviteUser={onInviteUser}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                        
                        {joinedTribes.map((tribe) => (
                            <TribeListItem
                                key={`joined-${tribe.id}`}
                                tribe={tribe}
                                currentUserId={currentUserId}
                                onLeaveTribe={onLeaveTribe}
                                onViewDetails={onViewDetails}
                            />
                        ))}
                    </List>
                </>
            )}

            {/* Empty State */}
            {invitedTribes.length === 0 && joinedTribes.length === 0 && ownedTribes.length === 0 && adminTribes.length === 0 && (
                <EmptyStateCard
                    title="Tu n'es pas dans une tribu."
                    caption="Les membres d'une tribu voient les listes de cadeaux des autres membres. Crées une tribu avec le bouton '+' en bas et invite du monde ! Tu peux être dans autant de tribus que tu le souhaites."
                    icon={<SentimentDissatisfied />}
                />
            )}
        </Box>
    );
};

export default TribeList;
