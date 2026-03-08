const {splitResume} = require('./chunker');
const {embedChunks, embedQuery} = require('./embedder');
const {upsertVectors, queryVectors,deleteVectors} = require('./vectorStore');
const {v4: uuidv4} = require('uuid');
const buildResumeRetriever=async(resumeText,userId)=>{
    const shortId = String(userId).slice(-8);
    const shortUuid = uuidv4().replace(/-/g, '').slice(0, 12);
    const namespace=`user-${shortId}-${shortUuid}`;
    const chunks=await splitResume(resumeText);
    const vectors=await embedChunks(chunks);
    await upsertVectors(chunks,vectors,namespace);

    const retreiver=async (query,topK=6)=>{
        const queryVec=await embedQuery(query);
        return await queryVectors(queryVec,namespace,topK);
    }

    const cleanup=async()=>{
        await deleteVectors(namespace);
    }
    return {retreiver,cleanup};

}
module.exports={buildResumeRetriever};