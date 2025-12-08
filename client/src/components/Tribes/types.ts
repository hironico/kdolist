/**
 * Common types for Tribes components
 */

export interface User {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
}

export interface UserWithMembership extends User {
    membershipId: string;
}

export interface GroupMembership {
    id: string;
    groupId: string;
    userId: string;
    status: 'INVITED' | 'REQUESTED' | 'MEMBER' | 'REJECTED' | 'ADMIN';
}

export interface Group {
    id: string;
    name: string;
    adminId: string;
    admin?: User;
    createdAt: Date;
    updatedAt: Date;
    groupMemberships?: GroupMembership[];
}

export interface TribeDetailsData {
    id: string;
    name: string;
    adminId: string;
    admin: User;
    createdAt: Date;
    updatedAt: Date;
    admins: UserWithMembership[];
    members: UserWithMembership[];
    invited: UserWithMembership[];
    declined: UserWithMembership[];
    totalMembers: number;
    totalLists: number;
}
