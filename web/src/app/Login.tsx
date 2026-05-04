import React, { useState } from "react";
import useEducationStore from "../store/education/useEducationStore.ts";
import useApiFetchs from '../hooks/useApiFetchs.ts';
import uabcs from '../assets/uabcs.svg';
import wireladders from '../assets/wireladders-icon.svg';
import cubes from '../assets/bottom-design.svg';

const Login = () => {
	const { state } = useEducationStore()
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const { dbLogin } = useApiFetchs();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		dbLogin(identifier, password);
	}

	if (state.token) return null;

	return (
		<div className="flex flex-col w-full h-screen md:flex-row">
			{/* Left Side - Branding Section */}
			<div className="flex flex-col md:w-2/5 w-full md:h-full h-fit  bg-wireladders-blue">
				<div className="flex md:flex-col flex-row w-full md:items-center md:h-1/2 h-fit">
					<img className="md:w-1/3 w-1/6 h-auto md:mt-3 mt-2 md:mb-0 mb-2 md:ml-0 ml-2" src={wireladders} alt="wireladders" />
					<div className="flex flex-col w-full items-center">
						<p className="font-title text-7xl text-white">
							Wires&Ladders
						</p>
						<div className="h-1 w-3/4 bg-white -mt-3"></div>
						<label className="text-white! text-center font-bold text-xl " >Editor de Preguntas</label>
					</div>
				</div>
				<div className="flex w-auto md:h-1/2 h-0 md:visible invisible">
					<img className="w-full object-contain place-self-end" src={cubes} alt="bottom design" />
				</div>
			</div>
			{/* Right Side - Login Form Section */}
			<div className="flex flex-col md:w-3/5 w-full h-full bg-repeat bg-[url('/bg-pattern.svg')]  items-center justify-center">
				<div className="flex flex-col md:w-7/12 w-11/12 h-10/12 bg-white border border-wireladders-blue ">  {/* Login Form Container */}
					<div className="flex w-full h-1/6 justify-center"> {/* Logo Section */}
						<img className="w-1/5 object-contain -mt-15" src={uabcs} alt="Logo" />
					</div>
					<div className="flex w-full place-content-center items-center h-1/12"> { /* Colored Bars */}
						<div className="w-1/6 h-2 mx-1 bg-wireladders-light-blue"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-red"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-green"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-yellow"></div>
					</div>
					<div className="flex flex-col w-full place-content-center items-start  h-1/6 px-5"> {/* Welcome Section */}
						<label className="font-manrope text-2xl font-extrabold text-wireladders-dark-blue" >Bienvenido.</label>
						<label className="font-manrope text-xs font-bold text-wireladders-dark-blue" >Ingrese sus credenciales para continuar</label>
					</div>
					<div className="flex flex-col place-content-center h-3/6"> {/* Form Section */}
						<form className="flex flex-col px-5" onSubmit={handleLogin}>
							<input className="rounded-lg border-wireladders-dark-blue border-2 py-1 my-3 px-2"
								id='identifier'
								placeholder='Ingrese su usuario o email'
								onChange={(e) => setIdentifier(e.target.value)}
								value={identifier}
								type="text"
							/>
							<input className="rounded-lg border-wireladders-dark-blue border-2 py-1 my-3 px-2"
								id='password'
								placeholder='Ingrese la contraseña'
								onChange={(e) => setPassword(e.target.value)}
								value={password}
								type="password"
							/>
							<button type="submit" className="md:m-10 m-5 px-5 py-1 rounded bg-wireladders-blue text-white! font-bold">
								Iniciar sesión
							</button>
						</form>
					</div>
					<div className="flex w-full place-content-center items-center h-1/12"> { /* Colored Bars */}
						<div className="w-1/6 h-2 mx-1 bg-wireladders-light-blue"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-red"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-green"></div>
						<div className="w-1/6 h-2 mx-1 bg-wireladders-yellow"></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login