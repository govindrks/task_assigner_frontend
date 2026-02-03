// import api from "./axios";

// /* ================= ORGANIZATIONS ================= */

// /**
//  * Get organizations of logged-in user
//  * GET /api/organizations/my
//  */
// export const getMyOrganizations = async () => {
//   const res = await api.get("/api/organizations/my");


//   return Array.isArray(res.data.organizations)
//     ? res.data.organizations
//     : [];
// };

// /**
//  * Create organization
//  * POST /api/organizations
//  */
// export const createOrganization = async (payload) => {
//   const res = await api.post("/api/organizations", payload);
//   return res.data;
// };

// /**
//  * Get organization details
//  * GET /api/organizations/:orgId
//  */
// export const getOrganizationDetails = async (orgId) => {
//   const res = await api.get(`/api/organizations/${orgId}`);
//   return res.data;
// };

// /**
//  * Update organization (ORG_ADMIN only)
//  * PATCH /api/organizations/:orgId
//  */
// export const updateOrganization = async (orgId, payload) => {
//   const res = await api.patch(`/api/organizations/${orgId}`, payload);
//   return res.data;
// };

// /**
//  * Get organization members (ORG_ADMIN only)
//  * Used for:
//  * - Task assignment dropdown
//  * - Member management
//  */
// export const getOrganizationMembers = async (orgId) => {
//   const res = await api.get(`/api/organizations/${orgId}/members`);
//   return res.data;
// };

// /**
//  * Remove member (ORG_ADMIN only)
//  * DELETE /api/organizations/:orgId/members/:userId
//  */
// export const removeOrganizationMember = async (orgId, userId) => {
//   const res = await api.delete(
//     `/api/organizations/${orgId}/members/${userId}`
//   );
//   return res.data;
// };

// /**
//  * Update member role (ORG_ADMIN only)
//  * PATCH /api/organizations/:orgId/members/:userId/role
//  */
// export const updateMemberRole = async (orgId, userId, role) => {
//   const res = await api.patch(
//     `/api/organizations/${orgId}/members/${userId}/role`,
//     { role }
//   );
//   return res.data;
// };


import api from "./axios";

export const getMyOrganizations = async () => {
  const res = await api.get("/api/v1/org/organizations/my");
  return res.data;
};

export const createOrganization = async (payload) => {
  const res = await api.post("/api/v1/org/organizations", payload);
  return res.data;
};

export const getOrganizationMembers = (orgId) =>
  api.get(`/api/v1/org/organizations/${orgId}/members`);


export const removeOrganizationMember = async (userId) => {
  const res = await api.delete(`/api/v1/org/organizations/members/${userId}`);
  return res.data;
};
export const updateMemberRole = async (userId, role) => {
  const res = await api.patch(
    `/api/v1/org/organizations/members/${userId}/role`,
    { role }
  );
  return res.data;
};