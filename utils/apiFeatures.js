// BUILD QUERY 
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1A) Filtering
        // making copy of the ours query : 

        const queryObj = {
            ...this.queryString
        };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // {difficulty : 'easy' , duration : {$gte:5}};
        // {difficulty : 'easy' , duration : { gte:5}}; in the browser writing query string without $ so we put $ in front of the queryStr
        // gte , gt , lte , lt

        // let query = Tour.find(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));

        return this; // this means entire object 
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            // sort(price ratingsAvrage)
            //if in the api address insted of writing sort , write -sort then sorting vice versa
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // if(this.queryString.page){
        //     const numTours = await Tour.countDocuments(); //counDocuments method return a promis so we use await to get data and return it
        //     if(skip >= numTours) throw new Error('This page does not exist');
        // }
        return this;
    }
}

module.exports = APIFeatures