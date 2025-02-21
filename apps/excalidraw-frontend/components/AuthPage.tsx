export default function AuthPage({signup}:{signup:boolean}){

    return (

        <div>
            <div>{signup ? "signup":"signin"}</div>
            <div>
                <div>
                    <label htmlFor="email" >Email</label>
                    <input type="text" id="email" placeholder="hello@gmail.com" />
                </div>

                <div>
                    <label htmlFor="username" >Username</label>
                    <input type="text" id="username" placeholder="hello" />
                </div>

                <div>
                    <label htmlFor="password" >Username</label>
                    <input type="text" id="password" placeholder="1245" />
                </div>

            </div>
        </div>

    )

}