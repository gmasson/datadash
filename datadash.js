/*
 * DataDash - https://github.com/gmasson/datadash/
 * Este projeto oferece dashboards personalizáveis com suporte a temas claro e escuro, permitindo uma análise de dados intuitiva através de uma interface moderna e responsiva.
 * Utiliza variáveis CSS para facilitar a manutenção e a customização dos estilos.
 * 
 * Licença MIT - http://opensource.org/licenses/MIT
 */

function animateOver(duration, draw) {
	const start = performance.now();
	function frame(time) {
		const progress = Math.min((time - start) / duration, 1);
		draw(progress);
		if (progress < 1) requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

function createCustomTooltip(text, x, y) {
	if (!text) return;

	let tooltip = document.getElementById('chartTooltip');
	if (!tooltip) {
		tooltip = document.createElement('div');
		tooltip.id = 'chartTooltip';
		document.body.appendChild(tooltip);
	}
	if (!tooltip) return;

	tooltip.textContent = text;
	tooltip.style.display = 'block';

	const rect = tooltip.getBoundingClientRect();
	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;

	let left = x + window.scrollX + 15;
	let top = y + window.scrollY + 15;

	if (left + rect.width > windowWidth) {
		left = x - rect.width - 10;
	}

	if (top + rect.height > windowHeight) {
		top = y - rect.height - 10;
	}

	tooltip.style.left = `${left}px`;
	tooltip.style.top = `${top}px`;
}

function hideTooltip() {
	const tooltip = document.getElementById('chartTooltip');
	if (!tooltip) return;
	tooltip.style.display = 'none';
}

const CONFIG = {
	animation: {
		duration: 1000
	},
	chart: {
		margin: 10,
		padding: 30
	},
	colors: {
		default: [
			"#1976d2", "#2e7d32", "#ff9800", "#d32f2f", "#0097a7",
			"#8e24aa", "#f4511e", "#43a047", "#e53935", "#1e88e5"
		]
	}
};

function getDefaultColor(index) {
	return CONFIG.colors.default[index % CONFIG.colors.default.length];
}

function getChartColor(box, index) {
	const definedColor = box.getAttribute('datadash-color');
	if (definedColor && definedColor.trim() !== '') {
		return definedColor;
	}
	return getDefaultColor(index);
}

function applyChartColor(ctx, box, baseColor, x, y, width, height) {
	if (box.classList.contains('gradient')) {
		let darkColor = darkenColor(baseColor, 20);
		let grad = ctx.createLinearGradient(x, y, x + width, y + height);
		grad.addColorStop(0, baseColor);
		grad.addColorStop(1, darkColor);
		ctx.fillStyle = grad;
	} else {
		ctx.fillStyle = baseColor;
	}
}

function normalizeNumberString(value) {
	if (typeof value !== 'string') return value;
	value = value.trim();
	if (value.indexOf(',') !== -1) {
		if (value.indexOf('.') !== -1) {
			value = value.replace(/\./g, '');
			value = value.replace(',', '.');
		} else {
			value = value.replace(',', '.');
		}
	}
	return value;
}

function parseNumber(value, format) {
	if (typeof value === 'string') {
		value = value.trim();
		if (format && ["brl", "usd", "eur"].includes(format.toLowerCase())) {
			let digits = value.replace(/\D/g, '');
			if (digits.length > 2) {
			value = digits.slice(0, -2) + '.' + digits.slice(-2);
			} else {
			value = '0.' + digits.padStart(2, '0');
			}
		} else {
			value = normalizeNumberString(value);
		}
	}
	return parseFloat(value) || 0;
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(dateInput, formatStr = 'dd/mm/yyyy') {
	let date = new Date(dateInput);
	const day = ("0" + date.getDate()).slice(-2);
	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const year = date.getFullYear();
	switch (formatStr.toLowerCase()) {
		case 'dd/mm/yyyy':
			return `${day}/${month}/${year}`;
		case 'mm/dd/yyyy':
			return `${month}/${day}/${year}`;
		case 'yyyy-mm-dd':
			return `${year}-${month}-${day}`;
		default:
			return date.toLocaleDateString();
	}
}

function formatNumber(value, formatStr, prefix = '', suffix = '') {
	if (typeof value === 'string') {
		value = normalizeNumberString(value);
	}
	let num = parseFloat(value) || 0;
	let format = (formatStr || "int").toLowerCase();
	let formattedValue = '';

	switch(format) {
	case "int":
		formattedValue = Math.round(num).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
		break;
	case "float":
		formattedValue = num.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
		break;
	case "dec":
		formattedValue = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		break;
	case "brl":
		formattedValue = num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
		break;
	case "usd":
		formattedValue = num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
		break;
	case "eur":
		formattedValue = num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
		break;
	case "btc":
		formattedValue = num.toFixed(8) + " BTC";
		break;
	case "percent":
		formattedValue = num.toFixed(2) + "%";
		break;
	case "compact":
		formattedValue = num.toLocaleString('en', { notation: "compact", compactDisplay: "short" });
		break;
	case "sci":
		formattedValue = num.toExponential(2);
		break;
	case "bytes":
		formattedValue = formatBytes(num);
		break;
	default:
		formattedValue = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	return prefix + formattedValue + suffix;
}

function animateValue(element, finalValue, duration, prefix, suffix, formatStr) {
	animateOver(duration, function(progress) {
		let currentValue = finalValue * progress;
		element.innerText = formatNumber(currentValue, formatStr, prefix, suffix);
	});
}

function darkenColor(color, percent) {
	if (color.startsWith('#')) {
		let r, g, b;
		if (color.length === 4) {
			r = parseInt(color[1] + color[1], 16);
			g = parseInt(color[2] + color[2], 16);
			b = parseInt(color[3] + color[3], 16);
		} else if (color.length === 7) {
			r = parseInt(color.substr(1,2), 16);
			g = parseInt(color.substr(3,2), 16);
			b = parseInt(color.substr(5,2), 16);
		} else {
			return color;
		}
		r = Math.floor(r * (100 - percent) / 100);
		g = Math.floor(g * (100 - percent) / 100);
		b = Math.floor(b * (100 - percent) / 100);
		return `rgb(${r}, ${g}, ${b})`;
	} else if (color.startsWith('rgb')) {
		const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		if (match) {
			let r = parseInt(match[1]);
			let g = parseInt(match[2]);
			let b = parseInt(match[3]);
			const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
			r = Math.floor(r * (100 - percent) / 100);
			g = Math.floor(g * (100 - percent) / 100);
			b = Math.floor(b * (100 - percent) / 100);
			return color.startsWith('rgba') ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
		}
		return color;
	}
	return color;
}

const DataDash = {
	init() {
	const boxes = document.querySelectorAll('.datadash .box');
	boxes.forEach(box => {
		if (!box.dataset.initialContent) {
		box.dataset.initialContent = box.innerHTML.trim();
		}
		
		const config = {
		type: (box.getAttribute('datadash-type') || '').toLowerCase(),
		title: box.getAttribute('datadash-title') || '',
		content: box.getAttribute('datadash-content') || '',
		prefix: box.getAttribute('datadash-prefix') || '',
		suffix: box.getAttribute('datadash-suffix') || '',
		format: box.getAttribute('datadash-format') || 'int'
		};

		this.initBox(box, config);
	});
	},

	initBox(box, config) {
	let newMarkup = `<div class="inserted-content">`;
	newMarkup += `<div class="box-title">${config.title}</div>`;

	if (["bar","pie","line","donut","radar","gauge"].includes(config.type)) {
		newMarkup += `<div class="chart-container"><canvas></canvas></div>`;
	} else if (config.type === "number") {
		newMarkup += `<div class="box-content"></div>`;
	} else {
		newMarkup += `<div class="box-content">${config.prefix}${config.content}${config.suffix}</div>`;
	}
	newMarkup += `</div>`;

	if (!box.dataset.initialized) {
		newMarkup += `<div class="original-content">${box.dataset.initialContent}</div>`;
		box.dataset.initialized = "true";
	}

	box.innerHTML = newMarkup;

	switch(config.type) {
		case 'number':
		this.initNumber(box, config.prefix, config.suffix, config.format);
		break;
		case 'bar':
		this.initBarChart(box, config.prefix, config.suffix, config.format);
		break;
		case 'pie':
		this.initPieChart(box, config.prefix, config.suffix, config.format);
		break;
		case 'line':
		this.initLineChart(box, config.prefix, config.suffix, config.format);
		break;
		case 'donut':
		this.initDonutChart(box, config.prefix, config.suffix, config.format);
		break;
		case 'radar':
		this.initRadarChart(box, config.prefix, config.suffix, config.format);
		break;
		case 'gauge':
		this.initGaugeChart(box, config.prefix, config.suffix, config.format);
		break;
		default:
		if(config.type !== "refresh") {
			console.warn("Tipo não reconhecido:", config.type);
		}
	}
	},

	initNumber(box, prefix, suffix, format) {
	const boxContent = box.querySelector('.box-content');
	const rawValue = box.getAttribute('datadash-content');
	const finalValue = parseNumber(rawValue, format);
	animateValue(boxContent, finalValue, 1000, prefix, suffix, format);
	},

	initBarChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;

	// Não modificar mais a altura do container
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');

	this.clearExternalValues(container);

	let rawData = [];
	try {
		rawData = JSON.parse(box.getAttribute('datadash-data') || '[]');
	} catch (e) {
		console.error("Erro ao parsear dados do gráfico de barras:", e);
	}
	if (!rawData.length) return;

	const width = canvas.width;
	const height = canvas.height;
	const maxVal = Math.max(...rawData.map(item => parseNumber(item.value, format)));
	const barMargin = 10;
	const barWidth = (width - (rawData.length + 1) * barMargin) / rawData.length;

	canvas.barElements = [];
	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		canvas.barElements = [];
		
		rawData.forEach((item, index) => {
		const numericValue = parseNumber(item.value, format);
		const fullBarHeight = (numericValue / maxVal) * (height - 20);
		const currentBarHeight = fullBarHeight * progress;
		const x = barMargin + index * (barWidth + barMargin);
		const y = height - currentBarHeight;
		
		const baseColor = getChartColor(box, index);
		applyChartColor(ctx, box, baseColor, x, y, barWidth, currentBarHeight);
		ctx.fillRect(x, y, barWidth, currentBarHeight);
		canvas.barElements.push({
			x, y,
			width: barWidth,
			height: currentBarHeight,
			value: item.label + ": " + formatNumber(item.value, format, prefix, suffix)
		});
		
		if (progress === 1) {
			const valueDiv = document.createElement('div');
			valueDiv.className = 'chart-external-value';
			valueDiv.style.left = (x + barWidth / 2) + 'px';
			valueDiv.textContent = formatNumber(numericValue, format, prefix, suffix);
			container.appendChild(valueDiv);
		}
		});
		// Remove old legends if any
		let oldLegends = container.querySelectorAll('.bar-legend');
		oldLegends.forEach(el => el.remove());

		// Create legend container below the chart
		const legendContainer = document.createElement('div');
		legendContainer.className = 'chart-bar-legend-container';
		container.appendChild(legendContainer);

		// Add legends aligned with bars
		rawData.forEach((item, index) => {
			const x = barMargin + index * (barWidth + barMargin) + barWidth/2;
			const legendItem = document.createElement('div');
			legendItem.className = 'chart-bar-legend';
			legendItem.style.position = 'absolute';
			legendItem.style.left = x + 'px';
			legendItem.style.transform = 'translateX(-50%)';
			legendItem.textContent = item.label;
			legendContainer.appendChild(legendItem);
		});

	});

	addChartTooltip(canvas, (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		const bar = canvas.barElements?.find(b => (
			x >= b.x &&
			x <= (b.x + b.width) &&
			y >= b.y &&
			y <= (b.y + b.height)
		));
		return bar ? bar.value : null;
	});
	},

	initPieChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');

	this.clearExternalValues(container);

	let rawData = [];
	try {
		rawData = JSON.parse(box.getAttribute('datadash-data') || '[]');
	} catch (e) {
		console.error("Erro ao parsear dados do gráfico de pizza:", e);
	}
	if (!rawData.length) return;

	const width = canvas.width;
	const height = canvas.height;
	const radius = Math.min(width, height) / 2 * 0.8;
	const centerX = width / 2;
	const centerY = height / 2;
	const total = rawData.reduce((acc, cur) => acc + parseNumber(cur.value, format), 0);

	canvas.pieElements = [];
	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		let startAngle = 0;
		
		rawData.forEach((item, index) => {
			const numericValue = parseNumber(item.value, format);
			const sliceAngle = (numericValue / total) * 2 * Math.PI;
			const currentSliceAngle = sliceAngle * progress;
			const endAngle = startAngle + currentSliceAngle;
			
			const baseColor = getChartColor(box, index);
			if (box.classList.contains('gradient')) {
				let darkColor = darkenColor(baseColor, 20);
				let grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
				grad.addColorStop(0, baseColor);
				grad.addColorStop(1, darkColor);
				ctx.fillStyle = grad;
			} else {
				ctx.fillStyle = baseColor;
			}
			
			ctx.beginPath();
			ctx.moveTo(centerX, centerY);
			ctx.arc(centerX, centerY, radius, startAngle, endAngle);
			ctx.closePath();
			ctx.fill();
			
			if (progress === 1) {
				canvas.pieElements.push({
					centerX,
					centerY,
					radius,
					startAngle,
					endAngle: startAngle + sliceAngle,
					value: formatNumber(numericValue, format, prefix, suffix)
				});
			}
			
			if (progress === 1) {
				const midAngle = startAngle + currentSliceAngle / 2;
				const labelX = centerX + (radius + 15) * Math.cos(midAngle);
				const labelY = centerY + (radius + 15) * Math.sin(midAngle);
				const valueDiv = document.createElement('div');
				valueDiv.className = 'chart-external-value';
				valueDiv.style.left = labelX + 'px';
				valueDiv.style.top = labelY + 'px';
				valueDiv.textContent = formatNumber(numericValue, format, prefix, suffix);
				container.appendChild(valueDiv);
			}
			
			startAngle += currentSliceAngle;
		});
	});

	addChartTooltip(canvas, (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const dx = x - centerX;
		const dy = y - centerY;
		const distance = Math.sqrt(dx*dx + dy*dy);
		let angle = Math.atan2(dy, dx);
		if(angle < 0) angle += 2 * Math.PI;
		if(distance <= radius) {
			const slice = canvas.pieElements.find(s => angle >= s.startAngle && angle <= s.endAngle);
			return slice ? slice.value : null;
		}
		return null;
	});

	this.createLegend(box, rawData.map((item, index) => ({
		label: item.label,
		value: formatNumber(item.value, format, prefix, suffix),
		color: getChartColor(box, index)
	})));
	},

	initLineChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;
	
	// Não modificar mais a altura do container
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');
	this.clearExternalValues(container);
	
	let rawData = [];
	try {
		rawData = JSON.parse(box.getAttribute('datadash-data') || '[]');
	} catch (e) {
		console.error("Erro ao parsear dados do gráfico de linha:", e);
	}
	if (!rawData.length) return;

	const series = Array.isArray(rawData[0]) ? rawData : [rawData];
	const numSeries = series.length;
	const numPoints = series[0].length;
	const padding = 30;
	const width = canvas.width;
	const height = canvas.height;

	let allValues = [];
	series.forEach(s => {
		s.forEach(item => {
			allValues.push(parseNumber(item.value, format));
		});
	});
	const maxVal = Math.max(...allValues);
	const minVal = Math.min(...allValues);
	const dataRange = (maxVal - minVal) || 1;
	const stepX = (width - 2 * padding) / (numPoints - 1);

	const seriesPoints = series.map(s =>
		s.map((item, index) => {
			const numericValue = parseNumber(item.value, format);
			const x = padding + index * stepX;
			const y = height - padding - ((numericValue - minVal) / dataRange) * (height - 2 * padding);
			return { x, y, rawVal: numericValue, label: item.label };
		})
	);

	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		ctx.strokeStyle = '#ccc';
		ctx.beginPath();
		ctx.moveTo(padding, height - padding);
		ctx.lineTo(width - padding, height - padding);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(padding, height - padding);
		ctx.lineTo(padding, padding);
		ctx.stroke();

		seriesPoints.forEach((points, sIndex) => {
			ctx.beginPath();
			points.forEach((pt, i) => {
				const finalY = pt.y;
				const partialY = (height - padding) - ((height - padding - finalY) * progress);
				if(i === 0) ctx.moveTo(pt.x, partialY);
				else ctx.lineTo(pt.x, partialY);
			});
			const baseColor = getChartColor(box, sIndex);
			if (box.classList.contains('gradient')) {
				let darkColor = darkenColor(baseColor, 20);
				let grad = ctx.createLinearGradient(padding, 0, width - padding, 0);
				grad.addColorStop(0, baseColor);
				grad.addColorStop(1, darkColor);
				ctx.strokeStyle = grad;
			} else {
				ctx.strokeStyle = baseColor;
			}
			ctx.lineWidth = 2;
			ctx.stroke();
		});

		if(progress === 1) {
			seriesPoints.forEach((points, sIndex) => {
				points.forEach(pt => {
					ctx.save();
					ctx.fillStyle = "#000";
					ctx.beginPath();
					ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
					ctx.fill();
					ctx.restore();
					const valueDiv = document.createElement('div');
					valueDiv.className = 'chart-external-value';
					valueDiv.style.left = pt.x + 'px';
					valueDiv.style.top = (pt.y - 25) + 'px';
					valueDiv.textContent = formatNumber(pt.rawVal, format, prefix, suffix);
					container.appendChild(valueDiv);
				});
			});
		}
		// Remove old legends if any
		let oldLegends = container.querySelectorAll('.line-legend');
		oldLegends.forEach(el => el.remove());

		// Create legend container below the chart
		const legendContainer = document.createElement('div');
		legendContainer.className = 'chart-line-legend-container';
		container.appendChild(legendContainer);

		// Add legends aligned with points
		seriesPoints[0].forEach(pt => {
			const legendItem = document.createElement('div');
			legendItem.className = 'chart-line-legend';
			legendItem.style.position = 'absolute';
			legendItem.style.left = pt.x + 'px';
			legendItem.style.transform = 'translateX(-50%)';
			legendItem.textContent = pt.label;
			legendContainer.appendChild(legendItem);
		});
	});

	addChartTooltip(canvas, (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const tolerance = 5;
		for(let s = 0; s < seriesPoints.length; s++) {
			for(const pt of seriesPoints[s]) {
				if(Math.hypot(x - pt.x, y - pt.y) < tolerance) {
					return formatNumber(pt.rawVal, format, prefix, suffix);
				}
			}
		}
		return null;
	});
	},

	initDonutChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');

	this.clearExternalValues(container);

	let rawData = [];
	try {
		rawData = JSON.parse(box.getAttribute('datadash-data') || '[]');
	} catch (e) {
		console.error("Erro ao parsear dados do gráfico donut:", e);
	}
	if (!rawData.length) return;

	const width = canvas.width;
	const height = canvas.height;
	const outerRadius = Math.min(width, height) / 2 * 0.8;
	const innerRadius = outerRadius * 0.6;
	const centerX = width / 2;
	const centerY = height / 2;
	const total = rawData.reduce((acc, cur) => acc + parseNumber(cur.value, format), 0);

	canvas.donutElements = [];
	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		let startAngle = 0;
		rawData.forEach((item, index) => {
		const numericValue = parseNumber(item.value, format);
		const sliceAngle = (numericValue / total) * 2 * Math.PI;
		const currentSliceAngle = sliceAngle * progress;
		const endAngle = startAngle + currentSliceAngle;
		
		const baseColor = getChartColor(box, index);
		if (box.classList.contains('gradient')) {
			let darkColor = darkenColor(baseColor, 20);
			let grad = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
			grad.addColorStop(0, baseColor);
			grad.addColorStop(1, darkColor);
			ctx.fillStyle = grad;
		} else {
			ctx.fillStyle = baseColor;
		}
		
		ctx.beginPath();
		ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
		ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
		ctx.closePath();
		ctx.fill();
		
		if (progress === 1) {
			canvas.donutElements.push({
				centerX, centerY, innerRadius, outerRadius,
				startAngle, endAngle: startAngle + sliceAngle,
				value: formatNumber(numericValue, format, prefix, suffix)
			});
		}

		if (progress === 1) {
			const midAngle = startAngle + currentSliceAngle / 2;
			const labelX = centerX + (outerRadius + 15) * Math.cos(midAngle);
			const labelY = centerY + (outerRadius + 15) * Math.sin(midAngle);
			const valueDiv = document.createElement('div');
			valueDiv.className = 'chart-external-value';
			valueDiv.style.left = labelX + 'px';
			valueDiv.style.top = labelY + 'px';
			valueDiv.textContent = formatNumber(numericValue, format, prefix, suffix);
			container.appendChild(valueDiv);
		}
		
		startAngle += currentSliceAngle;
		});
	});

	addChartTooltip(canvas, (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const dx = x - centerX;
		const dy = y - centerY;
		const distance = Math.sqrt(dx*dx + dy*dy);
		let angle = Math.atan2(dy, dx);
		if(angle < 0) angle += 2 * Math.PI;
		if(distance <= outerRadius && distance >= innerRadius) {
			const slice = canvas.donutElements.find(s => angle >= s.startAngle && angle <= s.endAngle);
			return slice ? slice.value : null;
		}
		return null;
	});

	this.createLegend(box, rawData.map((item, index) => ({
		label: item.label,
		value: formatNumber(item.value, format, prefix, suffix),
		color: getChartColor(box, index)
	})));
	},

	initRadarChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');

	this.clearExternalValues(container);

	let rawData = [];
	try {
		rawData = JSON.parse(box.getAttribute('datadash-data') || '[]');
	} catch (e) {
		console.error("Erro ao parsear dados do gráfico radar:", e);
	}
	if (!rawData.length) return;

	const width = canvas.width;
	const height = canvas.height;
	const centerX = width / 2;
	const centerY = height / 2;
	const maxRadius = Math.min(width, height) / 2 * 0.8;
	const totalAxes = rawData.length;
	const maxValue = Math.max(...rawData.map(item => parseNumber(item.value, format)));

	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		for (let i = 0; i < totalAxes; i++) {
		const angle = (2 * Math.PI / totalAxes) * i;
		const x = centerX + maxRadius * Math.cos(angle);
		const y = centerY + maxRadius * Math.sin(angle);
		ctx.strokeStyle = '#ccc';
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(x, y);
		ctx.stroke();
		}
		
		ctx.beginPath();
		rawData.forEach((item, i) => {
		const angle = (2 * Math.PI / totalAxes) * i;
		const r = (parseNumber(item.value, format) / maxValue) * maxRadius * progress;
		const x = centerX + r * Math.cos(angle);
		const y = centerY + r * Math.sin(angle);
		if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
		});
		ctx.closePath();
		const baseColor = getChartColor(box, 0);
		if (box.classList.contains('gradient')) {
			let darkColor = darkenColor(baseColor, 20);
			let grad = ctx.createLinearGradient(centerX, centerY - maxRadius, centerX, centerY + maxRadius);
			grad.addColorStop(0, baseColor);
			grad.addColorStop(1, darkColor);
			ctx.fillStyle = grad;
		} else {
			ctx.fillStyle = 'rgba(75, 192, 192, 0.3)';
		}
		ctx.fill();
		ctx.strokeStyle = getDefaultColor(0);
		ctx.stroke();

		if (progress === 1) {
		rawData.forEach((item, i) => {
			const angle = (2 * Math.PI / totalAxes) * i;
			const r = (parseNumber(item.value, format) / maxValue) * maxRadius * progress;
			const x = centerX + r * Math.cos(angle);
			const y = centerY + r * Math.sin(angle);
			ctx.save();
			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.arc(x, y, 3, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
			ctx.save();
			ctx.fillStyle = "transparent";
			ctx.textAlign = "center";
			const labelText = formatNumber(parseNumber(item.value, format), format, prefix, suffix);
			const valueDiv = document.createElement('div');
			valueDiv.className = 'chart-external-value';
			valueDiv.style.left = (centerX + (r + 10) * Math.cos(angle)) + 'px';
			valueDiv.style.top = (centerY + (r + 10) * Math.sin(angle)) + 'px';
			valueDiv.textContent = labelText;
			container.appendChild(valueDiv);
			ctx.restore();
		});
		}
	});

	addChartTooltip(canvas, (e) => {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const tolerance = 10;
		
		for (let i = 0; i < rawData.length; i++) {
			const angle = (2 * Math.PI / totalAxes) * i;
			const r = (parseNumber(rawData[i].value, format) / maxValue) * maxRadius;
			const pointX = centerX + r * Math.cos(angle);
			const pointY = centerY + r * Math.sin(angle);
			
			if (Math.hypot(x - pointX, y - pointY) < tolerance) {
				return `${rawData[i].label}: ${formatNumber(rawData[i].value, format, prefix, suffix)}`;
			}
		}
		return null;
	});

	this.createLegend(box, rawData.map(item => ({
		label: item.label,
		value: formatNumber(item.value, format, prefix, suffix),
		color: getChartColor(box, 0)
	})));
	},

	initGaugeChart(box, prefix, suffix, format) {
	const canvas = box.querySelector('canvas');
	const container = canvas.parentElement;
	this.resizeCanvas(canvas);
	const ctx = canvas.getContext('2d');

	this.clearExternalValues(container);

	let dataObj = {};
	try {
		dataObj = JSON.parse(box.getAttribute('datadash-data') || '{}');
	} catch (e) {
		console.error("Erro ao parsear dados do gauge:", e);
	}
	const value = parseNumber(dataObj.value, format);
	const min = parseNumber(dataObj.min, format);
	const max = parseNumber(dataObj.max, format);
	const width = canvas.width;
	const height = canvas.height;
	const centerX = width / 2;
	const centerY = height * 0.8;
	const radius = Math.min(width, height) * 0.5;
	const startAngle = Math.PI;

	animateOver(1000, progress => {
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, startAngle, 0, false);
		ctx.lineWidth = 20;
		ctx.strokeStyle = '#eee';
		ctx.stroke();
		
		const targetAngle = startAngle + ((value - min) / (max - min)) * Math.PI;
		const animatedAngle = startAngle + (targetAngle - startAngle) * progress;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, startAngle, animatedAngle, false);
		const baseColor = getChartColor(box, 0);
		if (box.classList.contains('gradient')) {
		let darkColor = darkenColor(baseColor, 20);
		let grad = ctx.createLinearGradient(centerX, centerY - radius, centerX, centerY + radius);
		grad.addColorStop(0, baseColor);
		grad.addColorStop(1, darkColor);
		ctx.strokeStyle = grad;
		} else {
		ctx.strokeStyle = baseColor;
		}
		ctx.stroke();
		
		const needleLength = radius - 10;
		const needleX = centerX + needleLength * Math.cos(animatedAngle);
		const needleY = centerY + needleLength * Math.sin(animatedAngle);

		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(needleX, needleY);
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 2;
		ctx.stroke();

		if (progress === 1) {
			ctx.save();
			ctx.fillStyle = "transparent";
			ctx.textAlign = "center";
			const labelText = formatNumber(min + (value - min) * progress, format, prefix, suffix);
			const offset = 20;
			const labelX = centerX + (needleLength + offset) * Math.cos(animatedAngle);
			const labelY = centerY + (needleLength + offset) * Math.sin(animatedAngle);
			const valueDiv = document.createElement('div');
			valueDiv.className = 'chart-external-value';
			valueDiv.style.left = '50%';
			valueDiv.style.bottom = '15%';
			valueDiv.textContent = formatNumber(value, format, prefix, suffix);
			container.appendChild(valueDiv);
			ctx.restore();
			ctx.save();
			ctx.strokeStyle = '#999';
			ctx.lineWidth = 1;
			for (let i = 0; i <= 10; i++) {
				const angle = startAngle + (i / 10) * Math.PI;
				const tickLength = i % 5 === 0 ? 10 : 5;
				const x1 = centerX + (radius - tickLength) * Math.cos(angle);
				const y1 = centerY + (radius - tickLength) * Math.sin(angle);
				const x2 = centerX + radius * Math.cos(angle);
				const y2 = centerY + radius * Math.sin(angle);
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}
			ctx.restore();
		}
	});

	addChartTooltip(canvas, (e) => {
		const val = formatNumber(value, format, prefix, suffix);
		return val;
	});
	},

	resizeCanvas(canvas) {
		const container = canvas.parentElement;
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight;
	},

	createLegend(box, data) {
		if (!Array.isArray(data) || data.length === 0) return;
		const container = box.querySelector('.chart-container');
		let oldLegend = box.querySelector('.chart-legend');
		if (oldLegend) oldLegend.remove();

		const legend = document.createElement('div');
		legend.className = 'chart-legend';
		data.forEach(item => {
			const legendItem = document.createElement('div');
			legendItem.className = 'chart-legend-item';
			const colorBox = document.createElement('span');
			colorBox.style.backgroundColor = item.color || getDefaultColor(0);
			legendItem.appendChild(colorBox);
			const labelSpan = document.createElement('span');
			labelSpan.className = 'chart-label';
			labelSpan.textContent = item.label;
			legendItem.appendChild(labelSpan);
			legend.appendChild(legendItem);
		});
		container.parentElement.appendChild(legend);
	},

	clearExternalValues(container) {
		const oldValues = container.querySelectorAll('.chart-external-value');
		oldValues.forEach(el => el.remove());
	}
};

function initDatadashTooltips() {
	const tooltipElements = document.querySelectorAll('[datadash-tooltip]');

	tooltipElements.forEach(el => {
		el.addEventListener('mouseenter', (e) => {
			const tooltipText = el.getAttribute('datadash-tooltip');
			if (tooltipText) {
			createCustomTooltip(tooltipText, e.clientX, e.clientY);
			}
		});
		
		el.addEventListener('mouseleave', () => {
			hideTooltip();
		});
		
		el.addEventListener('mousemove', (e) => {
			const tooltipText = el.getAttribute('datadash-tooltip');
			if (tooltipText) {
				createCustomTooltip(tooltipText, e.clientX, e.clientY);
			}
		});
	});
}

function addChartTooltip(canvas, handler) {
	let timeout;

	canvas.addEventListener('mousemove', (e) => {
		clearTimeout(timeout);
		const text = handler(e);
		if (text) {
			createCustomTooltip(text, e.clientX, e.clientY);
		} else {
			hideTooltip();
		}
		});
		
		canvas.addEventListener('mouseleave', () => {
		clearTimeout(timeout);
		timeout = setTimeout(hideTooltip, 100);
	});
}

function initRefreshBoxes() {
	const refreshBoxes = document.querySelectorAll('.datadash [datadash-refresh]');
	refreshBoxes.forEach(box => {
		const intervalSeconds = parseInt(box.getAttribute('datadash-refresh'), 10) || 10;
		const prefix = box.getAttribute('datadash-prefix') || '';
		const suffix = box.getAttribute('datadash-suffix') || '';
		const now = new Date();
		const hh = ("0" + now.getHours()).slice(-2);
		const mm = ("0" + now.getMinutes()).slice(-2);
		const currentTime = hh + ':' + mm;
		const contentElem = box.querySelector('.box-content');
		if (contentElem) {
			contentElem.innerText = prefix + currentTime + suffix;
		} else {
			box.innerText = prefix + currentTime + suffix;
		}
		setTimeout(() => location.reload(), intervalSeconds * 1000);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	if (!document.getElementById('chartTooltip')) {
		const tooltip = document.createElement('div');
		tooltip.id = 'chartTooltip';
		document.querySelector('.datadash').appendChild(tooltip);
	}

	DataDash.init();
	initDatadashTooltips();
	initRefreshBoxes();
});