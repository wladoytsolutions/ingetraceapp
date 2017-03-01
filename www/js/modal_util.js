function ValidarFechasOperaciones(FechaDeInicio,FechaDeTermino)
{
	var Valido=false;
	var Respuesta="";
	
	//Convertiendo a float
	var anioIni=FechaDeInicio.substring(6, 10);
	var mesIni=FechaDeInicio.substring(3, 5);
	var diaIni=FechaDeInicio.substring(0, 2);
		
	var FecIni = parseFloat(anioIni+mesIni+diaIni);
		
	//Convertiendo a float
	var anioFin=FechaDeTermino.substring(6, 10);
	var mesFin=FechaDeTermino.substring(3, 5);
	var diaFin=FechaDeTermino.substring(0, 2);
	
	var FecFin = parseFloat(anioFin+mesFin+diaFin);
		
	if(FecIni!=FecFin)
	{
		if(FecIni < FecFin){
		   Valido=true;
		   Respuesta="ok";
		}
		else
		{
			Respuesta="intervalo";
		}
	}
	else
	{
		Valido=true;
		Respuesta="ok";
	}
	if(Valido)
	{
		var fechaInicio = new Date(anioIni+'-'+mesIni+'-'+diaIni+'').getTime();
		var fechaFin    = new Date(anioFin+'-'+mesFin+'-'+diaFin+'').getTime();
			
		var diff = fechaFin - fechaInicio;

		var Dif=diff/(1000*60*60*24);
		
		if(Dif>7)
		{
			Valido=false;
			Respuesta="exceso";
		}
	}
		
	return Respuesta;
}
function ValidarFechasOperacionesSinLimite()
{
	var Valido=false;
	
	var startDate = $('#inicio_filtroDatosSensorElectrico').val();
	startDate=String(startDate);
		
	//Convertiendo a float
	var anioIni=startDate.substring(6, 10);
	var mesIni=startDate.substring(3, 5);
	var diaIni=startDate.substring(0, 2);
		
	var FecIni = parseFloat(anioIni+mesIni+diaIni);
	
	var endDate = $('#termino_filtroDatosSensorElectrico').val();
	endDate=String(endDate);
		
	//Convertiendo a float
	var anioFin=endDate.substring(6, 10);
	var mesFin=endDate.substring(3, 5);
	var diaFin=endDate.substring(0, 2);
		
	var FecFin = parseFloat(anioFin+mesFin+diaFin);
		
	if(FecIni!=FecFin)
	{
		if(FecIni < FecFin){
		   Valido=true;
		}
	}
	else
	{
		Valido=true;
	}
	return Valido;
}