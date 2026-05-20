import { seedCommunityApis } from '../apps/web/src/lib/seed-community.ts'

async function main() {
  try {
    await seedCommunityApis()
    console.log('Seeding successful!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

main()
