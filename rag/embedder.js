const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require('@google/generative-ai');

const documentEmbedder = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const queryEmbedder = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_QUERY,
});
const embedChunks = async (chunks) => {
    if (!chunks || !Array.isArray(chunks)) {
        console.error("Error: getVectors expected an array but received:", typeof chunks);
        return [];
    }

    try {
        const texts = chunks.map(doc => doc.pageContent);
        // console.log(texts)
        if(!texts || !Array.isArray(texts)) {
            console.error("Error: Failed to extract pageContent from chunks. Result:", texts);
            return [];
        }
        console.log("Extracted Texts for Embedding:", texts);
        const res = await documentEmbedder.embedDocuments(texts);
        console.log(`Generated ${res.length} Vectors.`);
        return res;
    } catch (error) {
        console.error("Embedding Error:", error.message);
        throw error;
    }
};
const embedQuery = async (query) => {
    if (typeof query !== 'string') {
        console.error("Error: embedQuery expected a string but received:", typeof query);
        return [];
    }

    try {
        const res = await queryEmbedder.embedQuery(query);
        // console.log("Generated Query Vector:", res);
        return res;
    } catch (error) {
        console.error("Embedding Error:", error.message);
        throw error;
    }
}

module.exports = { embedChunks , embedQuery };