require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const { importSchema } = require('graphql-import')
const { Prisma } = require('prisma-binding')
const path = require('path')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200'  })

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
    findImage: (_, args, context, info) => {
        return client.search({
          index: 'fotoindex',
          body: { 
            query: {
              match : {
                filename: args.tag
              }
            }
          }
        }, (err, result) => {
          console.log(result);
          console.log(result.meta.request)
          if (err) console.log(err)
      })
    }
  },
  Mutation: {
    createOrder: (_, args, context, info) => {
      console.log(args);
      return context.prisma.mutation.createOrder(
        {
          data: {
            name: args.order.name,
            group: args.order.group,
            status: args.order.status,
            photos: {
              create: args.order.photos
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