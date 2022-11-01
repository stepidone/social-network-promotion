import { RegisterOptions } from 'hapi-swagger'

export default <RegisterOptions> {
  pathPrefixSize: 2,
  basePath: '/api/',
  grouping: 'tags',
  info: {
    title: 'API Documentation',
    description:
      'API Documentation',
  },
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      'x-keyPrefix': 'Bearer ',
    },
    basic: {
      type: 'basic',
    },
  },
  schemes: ['http', 'https'],
  security: [
    {
      Bearer: [],
    },
  ],
  jsonPath: '/documentation.json',
  documentationPath: '/documentation',
  debug: true,
}
