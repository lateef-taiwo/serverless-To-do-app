import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJafj5hLReei8DMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1wczRmcGN1ZG92eXFqYTAzLnVzLmF1dGgwLmNvbTAeFw0yMjExMDUx
OTQ5NDhaFw0zNjA3MTQxOTQ5NDhaMCwxKjAoBgNVBAMTIWRldi1wczRmcGN1ZG92
eXFqYTAzLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOO8ObKff4WuwNprzH5IxVOL5yn9Y7hl3ahPIXoHp3Ko9vmgcMrFNq8u7CeE
WZn1pKOlEocPtu9JYP4A9PJYZ5YJFylfa73goiYDBnnhGtZa1l5DadQ7CPXBR/yT
CcNNPar/cGs8K0imVGAhBnd4g+fQxrfQItnXZorNUEK6E7cGPTwh1+BOub9zJZRK
CB/ocFy+wTRPNHFCmW5wwxjmoxI5DYjbaRwEsJadAgsx3w2FTCcxdTzEnlGE8Z1R
6rsdsenQPc5eZrhyOYbiZz+HrG3XPT40Dx37zmqjNFmSVA8rsCZ5tzUMFybZdH7e
U2N6hfAIng4A6FIeayl1C4qagI0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQU6DCAuKEX8Dnyq6H3O6eF20Fd+QUwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAGG3/Dm0kiyo5NZ/ogERU5j0c97goKOiW/WDocPPI1
rTMZqZqfcPzPXpZwSQjGSo/EXywDbROSrU9puaavovbiABQ+k6inK8W5MXu0Eelm
OgxS6wjE3E9KZoL6M9lncY4iKSm5jVJWsQSkWn3DkX3p0j7QkTHiypjpB56TETNz
Ce7fYImBrKkdcAF04UW3lUBiskygYI7CbHod+tqTAtMAwngQQRdkECzLgCO8+4OV
o6XdKgGzPlJmivMIRcvOk4jntn4pu7e8A5MIbao6RWDEnGAT/T6GN35xQvg8GsbC
GcIi1IQb3GtcUOJAL+lJY67xjk6AUbv3SLY+SWZZDzJR
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  } catch(err) {
  logger.error('Error verifying token', { error: err.message })
}
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token
}
