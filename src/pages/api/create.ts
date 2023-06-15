// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {connectToMongo} from '../../utils/connectToMongo'
import redirect from '../../models/redirect'

import generateKey from '../../utils/keygen'
import createStatistics from '@/utils/createStatisticsForEntry'
//Use .. to get out of a folder

//Data is what will be sent in the end. In this case, if something goes wrong it is one of the latter. This is stupid, but who cares.
type Data = Link | SomethingWentWrong | AnythingButPOST

//Whatever comes before the string is what the response will receive, so if you type link, you will get link. Not url!
type Link = {
  url: string
}

type SomethingWentWrong = {
  error: string
}

type AnythingButPOST = {
  error_noPOST: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if(req.method === 'POST') {
    console.log('POST method request: api/create.ts');
    if(!req.body.url) {
      res.status(400).json({ error: 'Something went wrong...did you try an invalid URL?' });
      return;
    }
    await connectToMongo()

    let keyLength = 6;
    let key = generateKey(keyLength)
    while (await redirect.findOne({ key: key })) {
      keyLength++;
      key = generateKey(keyLength);
  }

    //Sends this over to be saved in the "redirect" folder of the database
    const URI = await redirect.create({ key: key, url: req.body.url})
    createStatistics(req, key);
    
    res.status(200).json({ url: process.env.WEBSITE + URI.key }) //This has to be at the bottom, otherwise ERR_HTTP_HEADERS_SENT
  }

  else {
    return res.status(400).json({ error_noPOST: 'Sorry, but this only accepts POST requests!'});
  }
}