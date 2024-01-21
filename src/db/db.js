import mongoose from "mongoose";


const connectionToDb = async () =>{
    try {

        const connectionResult = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`)
        console.log("DB connected :",connectionResult.connection.host);
        
    } catch (error) {
        
        console.log("MongoDB connection Failed",error);
        process.exit(1);

    }
}

export default connectionToDb;