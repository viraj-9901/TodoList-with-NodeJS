// import JwtStrategy from 'passport-jwt';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { User } from './models/user.model.js';
import passport from 'passport';


const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.ACCESS_TOKEN_SECRET
};

passport.use(new Strategy(opts, async (jwt_payload,next) => {
    const user = await User.findOne({_id: jwt_payload._id})
    console.log('token');
    if(user) {
        return next(null,user);
    }else{
        console.log('token');
        return next(null,error)
    }
}))

export default passport
