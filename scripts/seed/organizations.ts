import { faker } from '@faker-js/faker';
import { organizations, users, organizationMembers } from "../../src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function seedOrganizationsAndUsers(db: any) {
  console.log("  ↳ Seeding Organizations & Users...");

  const orgs: any[] = [];
  const generatedUsers: any[] = [];

  // Generate 5 Organizations
  for (let i = 0; i < 5; i++) {
    const isAgency = i === 0; // First org is the internal agency
    const orgId = uuidv4();
    const name = isAgency ? "Aarotech (Internal)" : faker.company.name();
    
    orgs.push({
      id: orgId,
      clerkOrgId: `org_${faker.string.alphanumeric(10)}`,
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      type: isAgency ? "internal" : "client",
      status: isAgency ? "client" : faker.helpers.arrayElement(["lead", "client"]),
      healthScore: faker.number.int({ min: 60, max: 100 }),
    });
  }

  await db.insert(organizations).values(orgs);

  // Generate Users (Internal Team + Clients)
  const roles = ["superadmin", "employee", "client"];
  
  for (let i = 0; i < 20; i++) {
    const userId = uuidv4();
    const isInternal = i < 5;
    const org = isInternal ? orgs[0] : faker.helpers.arrayElement(orgs.slice(1));
    
    generatedUsers.push({
      id: userId,
      clerkId: `user_${faker.string.alphanumeric(10)}`,
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: isInternal ? faker.helpers.arrayElement(["superadmin", "employee"]) : "client",
      userType: isInternal ? "internal" : "client",
      status: "active",
      avatarUrl: faker.image.avatar(),
    });
  }

  await db.insert(users).values(generatedUsers);

  // Link Users to Organizations
  const members = generatedUsers.map(u => {
    return {
      userId: u.id,
      organizationId: u.userType === "internal" ? orgs[0].id : faker.helpers.arrayElement(orgs.slice(1)).id,
      role: u.role === "superadmin" ? "admin" : "member",
    };
  });

  await db.insert(organizationMembers).values(members);

  return { orgs, users: generatedUsers };
}
