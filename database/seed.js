require('dotenv').config()
const { Prisma } = require('prisma-binding')

const db = new Prisma({
    typeDefs: 'src/generated/prisma.graphql',
    endpoint: process.env.PRISMA_URL
  });


const setup = async () => {
    const order = await db.mutation.createOrder({
        data: {
            id: 1,
            name: 'First order',
            group: 'Welpen',
            status: 'OPEN',
            photos: []
        }
    });
}

setup();