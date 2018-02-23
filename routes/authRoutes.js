const passport = require('passport')

module.exports = (app)=>{
  app.get('/', (req, res)=>{
    res.send('here it is')
  })

  app.get('/auth/google', passport.authenticate('google',{
    scope:['profile','email']
  }),
  (req,res)=>{
    res.send('user auth '+req.user)
    console.log('user'+req.user)}
  )

  app.get('/auth/google/callback', passport.authenticate('google'),
  (req, res)=>{
    res.send('user callback '+req.user)
    console.log('user callback '+req.user)

  }
)
 app.get('/api/user', (req, res)=>{
   res.send(req.user)

 })

 app.get('/api/logout', (req, res)=>{
   req.logout()
   res.send('logged out')
 })

}
