import { Request, Response, NextFunction } from 'express';
import sdk from '@ory/client';
/**
 * Instantiate Ory SDK for working with sessions
 */
const ory = new sdk.V0alpha2Api(
  new sdk.Configuration({
    basePath: '/.ory',
    baseOptions: {
      baseURL: 'http://localhost:4000'
    }
  })
);

/**
 * Checking the clients cookie for a valid session
 */
export const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await ory.toSession(undefined, req.header('cookie'));
    req.body = {};
    req.body.ory = session.data;
    req.body.ory.cookie = req.header('cookie');
    return next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: err.response.status,
      message: err.message
    });
  }
};
