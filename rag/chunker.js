const {RecursiveCharacterTextSplitter} = require('@langchain/textsplitters');
const splitResume=async(text)=>{
    const textSplitter=new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:50,
        separators:["\n\n","\n","."," "]
    });
    const chunks=await textSplitter.createDocuments([text]);
    // console.log("Generated Chunks:",chunks);
    return chunks;
};
module.exports={splitResume};