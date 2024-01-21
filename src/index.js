import dotenv from "dotenv"
import app from "./app.js"
import connectionToDb from "./db/db.js"

const PORT = process.env.PORT

// dot env config

dotenv.config(
    {path: './.env'}
)

// database connection 

connectionToDb()
.then(()=>{
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      })
})
.catch((err)=>{
    console.log("Error While Connecting to Database : ", err);
})