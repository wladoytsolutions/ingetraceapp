$(document).ready(function() {
	$("#ModalPage3").load("html_parts/modal_cargando.html");
	$("#btn_buscarGraficoElectrico").prop('disabled', false);

	$("#btn_buscarGraficoElectrico").click(function(e) {
			e.preventDefault();
			$("#btnValidar").trigger("click");
			if(formularioBusqueda.checkValidity())
			{
				$('#DivInicioOp').attr('class','form-group');
				$('#DivTerminoOp').attr('class','form-group');

				var ValOp=ValidarFechasOperaciones();
				if(ValOp=="ok"){
					//guardar_registro();
					$('#DivInicioOp').attr('class','form-group');
					$('#DivTerminoOp').attr('class','form-group');

					//CARGANDO DATOS
					$("#TablaDatosSensores").dataTable().fnDestroy();
					$("#tBodyDatosGrafico").html("");
					CargarDatosElectrico($('#inicio_filtroDatosSensorElectrico').val(),$('#termino_filtroDatosSensorElectrico').val());
				}else
				{
					if(ValOp=="intervalo")
					{
						$('#DivInicioOp').attr('class','form-group has-error');
						$('#DivTerminoOp').attr('class','form-group has-error');
						alert("La fecha de termino de operaciones("+$('#termino_filtroDatosSensorElectrico').val()+") es menor a la fecha de inicio de operaciones("+$('#inicio_filtroDatosSensorElectrico').val()+")");
					}
					if(ValOp=="exceso")
					{
						$('#DivInicioOp').attr('class','form-group has-error');
						$('#DivTerminoOp').attr('class','form-group has-error');
						alert("La diferencia de dias excede los 7 dias");
					}
				}
			}
	});


	$("#inicio_filtroDatosSensorElectrico").datepicker({
									format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
	$("#termino_filtroDatosSensorElectrico").datepicker({ format: "dd/mm/yyyy",
									language:"es",
									autoclose:true,
									orientation: "top auto"
									});
});
function CargarDatosElectrico(Inicio,Termino)
{
	$('#ModalPage3').popup('open', {
		transition: 'pop'
	});
	$(window).disablescroll();

	//Fecha inicio
	var FecIni=Inicio;
	var fecha_inicio=FecIni.substring(6, 10)+'-'+FecIni.substring(3, 5)+'-'+FecIni.substring(0, 2);
	$('#inicio_filtroDatosSensorElectrico').datepicker("setDate", new Date(parseInt(FecIni.substring(6, 10)),parseInt(FecIni.substring(3, 5))-1,parseInt(FecIni.substring(0, 2))));

	//Fecha termino
	var FecTerm=Termino;
	var fecha_termino=FecTerm.substring(6, 10)+'-'+FecTerm.substring(3, 5)+'-'+FecTerm.substring(0, 2);
	$('#termino_filtroDatosSensorElectrico').datepicker("setDate", new Date(parseInt(FecTerm.substring(6, 10)),parseInt(FecTerm.substring(3, 5))-1,parseInt(FecTerm.substring(0, 2))));

	var CuerpoDatos='';

	alert('Enviada '+fecha_inicio);

	$.post(RUTACONTROL,{
						accion 		 : 'DatosGraficoSensorElectrico',
						ID_SENSOR    : $('#H_SENSOR_ELECTRICO').val(),
						FechaInicio  : fecha_inicio,
						FechaTermino : fecha_termino
							},
	function(response) {
			var json = jQuery.parseJSON(response);

			$.each(json.ITEMS, function(i, d) {
				CuerpoDatos+='<tr><td style="width: 19%"><center>'+d.HORA+'</center></td><td style="width: 21%">';

				var imagen='';
				if(d.ACCION=="Closed")
				{
					imagen='<i style="color: #08fa06" class="glyphicon glyphicon-off"></i>';
				}
				else
				{
					imagen='<i style="color: #fd0002" class="glyphicon glyphicon-off"></i>';
				}

				CuerpoDatos+='<center>'+imagen+'</center><span style="display:none">'+d.ACCION+'</span></td>';

				CuerpoDatos+='<td style="width: 24%"><center>'+d.TIEMPO_DE_USO+'</center></td>';
				CuerpoDatos+='</tr>';
			});

			$("#tBodyDatosGrafico").html(CuerpoDatos);

			$("#tbl_DataGra").html($("#PanelBodyTablaDatosSensor").html());

			$.mobile.pageContainer.pagecontainer('change', '#p3', {
					transition: 'flip',
					changeHash: true,
					reverse: true,
					showLoadMsg: false
			});

	}).done(function(response) {
		$('#ModalPage2').popup('close');
		$(window).disablescroll("undo");
		setTimeout(function () {
			$("#TablaDatosSensores").dataTable({
					"language": {
						"url": "json/spanish.json"
					},
					"scrollY":        "230px",
					"bInfo"	 :	false,
					"scrollCollapse": true,
					"paging":         false,
					"searching": false,
					"order": [[ 0, "desc" ]]
			});
			setTimeout(function () {
				RecargarTabla();
			}, 250);
			$("#btn_buscarGrafico").prop('disabled', false);
		}, 750);
	});
}
function RecargarTabla()
{
	var divProblemas=$('#PanelBodyTablaDatosSensor').find('.dataTables_scrollHeadInner');
	$(divProblemas).css('width','100%');

	var tablaProblemas=$(divProblemas).find('table');
	$(tablaProblemas).css('width','100%');
	$(tablaProblemas).attr('style','margin-left: 0px; width: 100%; margin-bottom: -2px;');

	var divProblemas=$('#PanelBodyTablaDatosSensor').find('.dataTables_scrollHeadInner');
	$(divProblemas).css('width','100%');

	var tablaProblemas=$(divProblemas).find('table');
	$(tablaProblemas).css('width','100%');
	$(tablaProblemas).attr('style','margin-left: 0px; width: 100%; margin-bottom: -2px;');

	var divProblemas=$('#PanelBodyTablaDatosSensor').find('.dataTables_scrollHeadInner');
	$(divProblemas).css('width','100%');

	var tablefoot=$(divProblemas).find('table');
	$(tablefoot).css('margin-bottom','0');

	var tablaProblemas=$(divProblemas).find('table');
	$(tablaProblemas).css('width','100%');

	var divProblemas2=$('#PanelBodyTablaDatosAlarma').find('.dataTables_scrollHeadInner');
	$(divProblemas2).css('width','100%');

	var tablaProblemas2=$(divProblemas2).find('table');
	$(tablaProblemas2).css('width','100%');
}
function ValidarFechasOperaciones()
{
	var Valido=false;
	var Respuesta="";

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
