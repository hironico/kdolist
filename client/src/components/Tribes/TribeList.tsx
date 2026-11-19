import React from 'react';
import { List, Typography, Box } from '@mui/material';
import TribeListItem from './TribeListItem';
import { EmptyStateCard } from '../EmptyStateCard';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Group } from './types';
import { GroupAdd } from '@mui/icons-material';
import { FLOATING_ACTION_PILL_CLEARANCE } from '@/sections/FloatingActionPill';
import AddActionSection from '../AddActionSection';
import { nestedListSx } from '../styled';

interface TribeListProps {
    tribes: Group[];
    currentUserId?: string;
    /** Opens the tribe creation editor. When set, a "Créer une tribu" row is shown first. */
    onCreateTribe?: () => void;
    onAcceptInvite?: (membershipId: string) => void;
    onRejectInvite?: (membershipId: string) => void;
    onLeaveTribe?: (groupId: string) => void;
    onInviteUser: (groupId: string) => void;
    onDeleteTribe?: (groupId: string) => void;
    onViewDetails?: (groupId: string) => void;
}

// iOS inset grouped sections: small uppercase header above a rounded group.
const sectionHeaderSx = { display: 'block', mt: 3, mb: 0.5, px: 2 } as const;
const sectionListSx = { m: '0px', alignSelf: 'start', ...nestedListSx } as const;

/**
 * TribeList component that displays tribes separated into invitations and joined tribes.
 * Uses SwipeableListItem for each tribe with appropriate actions.
 */
const TribeList: React.FC<TribeListProps> = ({
    tribes,
    currentUserId,
    onCreateTribe,
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
        // This box is the only scroll area of the page (same height as the
        // other list pages: viewport minus the 64px header), so the global
        // page wrapper never scrolls.
        <Box
            width="100%"
            height="calc(100vh - 64px)"
            p={2}
            pt={0}
            pb={FLOATING_ACTION_PILL_CLEARANCE}
            sx={{ minWidth: 0, boxSizing: 'border-box', overflowY: 'auto', overflowX: 'hidden' }}
        >
            {/* Creating a tribe is done from here, not from the floating pill. */}
            {onCreateTribe && (
                <Box sx={{ mt: '15px' }}>
                    <AddActionSection label="Créer une tribu" icon={<GroupAdd />} onClick={onCreateTribe} />
                </Box>
            )}

            {/* Invitations Section */}
            {invitedTribes.length > 0 && (
                <>
                    <Typography variant="overline" color="text.secondary" component="h2" sx={sectionHeaderSx}>
                        Invitations reçues
                    </Typography>
                    <List sx={sectionListSx}>
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
                    <Typography variant="overline" color="text.secondary" component="h2" sx={sectionHeaderSx}>
                        Mes tribus
                    </Typography>
                    <List sx={sectionListSx}>
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
                    <Typography variant="overline" color="text.secondary" component="h2" sx={sectionHeaderSx}>
                        Tribus dont je suis membre
                    </Typography>
                    <List sx={sectionListSx}>
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
                    title="Tu n'es pas dans une tribu"
                    caption="Les membres d'une tribu voient les listes de cadeaux des autres membres. Crée une tribu avec « Créer une tribu » ci-dessus et invite du monde ! Tu peux être dans autant de tribus que tu le souhaites."
                    icon={<GroupsIcon />}
                />
            )}
        </Box>
    );
};

export default TribeList;
