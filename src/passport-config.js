// import JwtStrategy from 'passport-jwt';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { User } from './models/user.model.js';
import passport from 'passport';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "9f89dbe07891545c17d0a69bc7a36c05fc2fcda38d8e6fb629aaa1fd0e7c47fd"
};

passport.use(new Strategy(opts, async (jwt_payload,next) => {
    const user = await User.findOne({_id: jwt_payload._id})

    if(user) {
        return next(null,user);
    }else{
        return next(null,false);
    }
}))

export default passport
