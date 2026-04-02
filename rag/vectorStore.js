const {Pinecone}= require("@pinecone-database/pinecone");

const pc=new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const upsertVectors=async(chunks,vectors,namespace)=>{
    try{
        // console.log(process.env.PINECONE_INDEX_NAME,process.env.PINECONE_HOST);
        // console.log(chunks.length,vectors.length);
        const index=pc.index({host:process.env.PINECONE_HOST,name:process.env.PINECONE_INDEX_NAME});
        const records=chunks.map((chunk,i)=>({
            id:`${namespace}-chunk-${i}`,
            values:vectors[i],
            metadata:{
                text:chunk.pageContent,
                chunkIndex:i,
            },
        }));
        // console.log("Records length:", records.length);
        // console.log("Sample record id:", records[0]?.id);
        // console.log("Sample record values type:", typeof records[0]?.values);
        // console.log("Sample record values isArray:", Array.isArray(records[0]?.values));
        // console.log("Sample record values length:", records[0]?.values?.length);
        // console.log("Sample record first value:", records[0]?.values?.[0]);
        // const indexStats = await index.describeIndexStats();
        // console.log("Current Index Stats:", indexStats.dimension);
        const batchSize=100;
        for(let i=0;i<records.length;i+=batchSize){
            await index.namespace(namespace).upsert({records:records.slice(i,i+batchSize)});
        }


    }
        catch(error){
            console.error("Pinecone Upsert Error:",error.message);
            throw error;
        }
}
const queryVectors=async(queryVector,namespace,topK=5)=>{
    try{
        const index=pc.index({host:process.env.PINECONE_HOST,name:process.env.PINECONE_INDEX_NAME});
        const queryResult=await index.namespace(namespace).query({
            vector:queryVector,
            topK,
            includeMetadata:true,
        });
        return queryResult.matches.map(match=>({
            pageContent:match.metadata.text,
            metadata:match.metadata,
            score:match.score,
        }))
    }
    catch(error){
        console.error("Pinecone Query Error:",error.message);
        throw error;
    }
}
const deleteVectors=async(namespace)=>{
    try{
        const index=pc.index(process.env.PINECONE_INDEX_NAME);
        await index.namespace(namespace).deleteAll();
        console.log(`Deleted all vectors in namespace: ${namespace}`);
    }
    catch(error){
        console.error("Pinecone Delete Error:",error.message);
        throw error;
    }
}
module.exports={upsertVectors,queryVectors,deleteVectors};