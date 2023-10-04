import mongoose from "mongoose";

const connectDb = async (url) => {
    try {
        const DB_OPTIONS = {
            dbName: "YTjwt"
        }
        await mongoose.connect(url,DB_OPTIONS, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connected Successfully...')
    } catch (error) {
        console.log('Connected error...', error)
    }
}

export default connectDb