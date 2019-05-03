require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const { importSchema } = require('graphql-import')
const { Prisma } = require('prisma-binding')
const path = require('path')

const resolvers = {
  Query: {
    openOrders: (_, args, context, info) => {
      return context.prisma.query.orders(
        {
          where: {
            status: 'OPEN'
          }
        },
        info
      )
    },
  },
  Mutation: {
    createOrder: (_, args, context, info) => {
      return context.prisma.mutation.createOrder(
        {
          data: {
            title: args.title,
            content: args.content,
            slug: args.slug,
            author: {
              connect: {
                id: args.authorId
              }
            }
          }
        },
        info
      )
    },
  },
  Node: {
    __resolveType() {
      return null;
    }
  }
}

const typeDefs = importSchema(path.resolve('src/schema.graphql'))

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_URL
    })
  })
})

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})