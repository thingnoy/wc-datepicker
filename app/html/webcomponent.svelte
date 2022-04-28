<svelte:options tag="wc-datepicker" />

<script>
	/**
	 * Svelte WebComponent DatePicker
	 * =====================
	 *
	 * @contributors: Thingnoy <boyskypart@gmail.com> (https://github.com/thingnoy)
	 *
	 * @license: MIT License
	 *
	 */
	// import webcomponent from "@app/functions/webcomponent";
	// import { translate } from "@app/translations/translate";
	import { onMount, createEventDispatcher, tick } from "svelte";
	import { fly, fade } from "svelte/transition";
	import { formatDate } from "@app/utils/date";
	import { keyCodes, keyCodesArray } from "./keyCodes";
	import { getMonths, areDatesEquivalent } from "./helpers";
	import ClickOutside from "./ClickOutside";

	const dispatch = createEventDispatcher();
	const today = new Date();
	const oneYear = 1000 * 60 * 60 * 24 * 365;

	// export let header; // headerText || $$props["header-text"] if you use dash separator

	let popover;

	// month or day
	export let defaultView = "day";
	export let onlyMonth = false;
	export let format = "YYYY/MM/DD";
	export let start = new Date(Date.now() - oneYear);
	export let end = new Date(Date.now() + oneYear);
	export let selected = null;
	export let dateChosen = false;
	export let trigger = null;
	export let selectableCallback = null;
	export let weekStart = 0;
	export let daysOfWeek = [
		// ['Sunday', 'Sun'],
		// ['Monday', 'Mon'],
		// ['Tuesday', 'Tue'],
		// ['Wednesday', 'Wed'],
		// ['Thursday', 'Thu'],
		// ['Friday', 'Fri'],
		// ['Saturday', 'Sat'],
		["อาทิตย์", "อา."],
		["จันทร์", "จ."],
		["อังคาร", "อ."],
		["พุธ", "พ."],
		["พฤหัสบดี", "พฤ."],
		["ศุกร์", "ศ."],
		["เสาร์", "ส."],
	];
	export let monthsOfYear = [
		// ['January', 'Jan'],
		// ['February', 'Feb'],
		// ['March', 'Mar'],
		// ['April', 'Apr'],
		// ['May', 'May'],
		// ['June', 'Jun'],
		// ['July', 'Jul'],
		// ['August', 'Aug'],
		// ['September', 'Sep'],
		// ['October', 'Oct'],
		// ['November', 'Nov'],
		// ['December', 'Dec'],
		["มกราคม", "ม.ค."],
		["กุมภาพันธ์", "ก.พ."],
		["มีนาคม", "มี.ค."],
		["เมษายน", "เม.ย."],
		["พฤษภาคม", "พ.ค."],
		["มิถุนายน", "มิ.ย."],
		["กรกฎาคม", "ก.ค."],
		["สิงหาคม", "ส.ค."],
		["กันยายน", "ก.ย."],
		["ตุลาคม", "ต.ค."],
		["พฤศจิกายน", "พ.ย."],
		["ธันวาคม", "ธ.ค."],
	];

	selected = selected
		? selected.getTime() < start.getTime() || selected.getTime() > end.getTime()
			? start
			: selected
		: null;

	export let style = "";

	// theming variables:
	export let buttonBackgroundColor = "#fff";
	export let buttonBorderColor = "#eee";
	export let buttonTextColor = "#333";
	export let highlightColor = "#f7901e";
	export let dayBackgroundColor = "none";
	export let dayTextColor = "#4a4a4a";
	export let dayHighlightedBackgroundColor = "#efefef";
	export let dayHighlightedTextColor = "#4a4a4a";

	let sortedDaysOfWeek =
		weekStart === 0
			? daysOfWeek
			: (() => {
					let dow = daysOfWeek.slice();
					dow.push(dow.shift());
					return dow;
			  })();

	let highlighted = today;
	let shouldShakeDate = false;
	let shakeHighlightTimeout;
	let month = today.getMonth();
	let year = today.getFullYear();

	let isOpen = false;
	let isClosing = false;

	today.setHours(0, 0, 0, 0);

	function assignmentHandler(formatted) {
		if (!trigger) {
			return;
		}
		trigger.innerHTML = formatted;
	}

	$: months = getMonths(start, end, selectableCallback, weekStart);

	let monthIndex = 0;
	$: {
		monthIndex = 0;
		for (let i = 0; i < months.length; i += 1) {
			if (months[i].month === month && months[i].year === year) {
				monthIndex = i;
			}
		}
	}
	$: visibleMonth = months[monthIndex];
	$: visibleMonthId = year + month / 100;
	$: lastVisibleDate = visibleMonth?.weeks[visibleMonth.weeks.length - 1].days[6].date;
	$: firstVisibleDate = visibleMonth?.weeks[0].days[0].date;
	$: canIncrementMonth = monthIndex < months.length - 1;
	$: canDecrementMonth = monthIndex > 0;
	$: wrapperStyle = `
    --button-background-color: ${buttonBackgroundColor};
    --button-border-color: ${buttonBorderColor};
    --button-text-color: ${buttonTextColor};
    --highlight-color: ${highlightColor};
    --day-background-color: ${dayBackgroundColor};
    --day-text-color: ${dayTextColor};
    --day-highlighted-background-color: ${dayHighlightedBackgroundColor};
    --day-highlighted-text-color: ${dayHighlightedTextColor};
    ${style}
  `;

	export let formattedSelected = selected;
	$: {
		formattedSelected = typeof format === "function" ? format(selected) : formatDate(selected, format);
	}

	function changeMonth(selectedMonth) {
		month = selectedMonth;
		highlighted = new Date(year, month, 1);
	}

	function incrementMonth(direction, day = 1) {
		if (direction === 1 && !canIncrementMonth) {
			return;
		}
		if (direction === -1 && !canDecrementMonth) {
			return;
		}
		let current = new Date(year, month, 1);
		current.setMonth(current.getMonth() + direction);
		month = current.getMonth();
		year = current.getFullYear();
		highlighted = new Date(year, month, day);
	}

	function getDefaultHighlighted() {
		const date = selected ? selected : today;
		return new Date(date);
	}

	const getDay = (m, d, y) => {
		let theMonth = months.find((aMonth) => aMonth.month === m && aMonth.year === y);
		if (!theMonth) {
			return null;
		}
		// eslint-disable-next-line
		for (let i = 0; i < theMonth.weeks.length; ++i) {
			// eslint-disable-next-line
			for (let j = 0; j < theMonth.weeks[i].days.length; ++j) {
				let aDay = theMonth.weeks[i].days[j];
				if (aDay.month === m && aDay.day === d && aDay.year === y) {
					return aDay;
				}
			}
		}
		return null;
	};

	function incrementDayHighlighted(amount) {
		let proposedDate = new Date(highlighted);
		proposedDate.setDate(highlighted.getDate() + amount);
		let correspondingDayObj = getDay(proposedDate.getMonth(), proposedDate.getDate(), proposedDate.getFullYear());
		if (!correspondingDayObj || !correspondingDayObj.isInRange) {
			return;
		}
		highlighted = proposedDate;
		if (amount > 0 && highlighted > lastVisibleDate) {
			incrementMonth(1, highlighted.getDate());
		}
		if (amount < 0 && highlighted < firstVisibleDate) {
			incrementMonth(-1, highlighted.getDate());
		}
	}

	function checkIfVisibleDateIsSelectable(date) {
		const proposedDay = getDay(date.getMonth(), date.getDate(), date.getFullYear());
		return proposedDay && proposedDay.selectable;
	}

	function shakeDate(date) {
		clearTimeout(shakeHighlightTimeout);
		shouldShakeDate = date;
		shakeHighlightTimeout = setTimeout(() => {
			shouldShakeDate = false;
		}, 700);
	}

	function assignValueToTrigger(formatted) {
		assignmentHandler(formatted);
	}

	function registerSelection(chosen) {
		if (!checkIfVisibleDateIsSelectable(chosen) && !onlyMonth) {
			return shakeDate(chosen);
		}
		// eslint-disable-next-line
		close();
		selected = chosen;
		dateChosen = true;
		assignValueToTrigger(formattedSelected);
		return dispatch("dateSelected", { date: chosen });
	}

	function handleKeyPress(evt) {
		if (keyCodesArray.indexOf(evt.keyCode) === -1) {
			return;
		}
		evt.stopPropagation();
		switch (evt.keyCode) {
			case keyCodes.left:
				incrementDayHighlighted(-1);
				break;
			case keyCodes.up:
				incrementDayHighlighted(-7);
				break;
			case keyCodes.right:
				incrementDayHighlighted(1);
				break;
			case keyCodes.down:
				incrementDayHighlighted(7);
				break;
			case keyCodes.pgup:
				incrementMonth(-1);
				break;
			case keyCodes.pgdown:
				incrementMonth(1);
				break;
			case keyCodes.escape:
				// eslint-disable-next-line
				close();
				break;
			case keyCodes.enter:
				registerSelection(highlighted);
				break;
			default:
				break;
		}
	}

	function registerClose() {
		document.removeEventListener("keydown", handleKeyPress);
		dispatch("close");
	}

	function close() {
		if (popover) {
			closePopOver();
		}
		registerClose();
	}

	function registerOpen() {
		highlighted = getDefaultHighlighted();
		const date = selected ? selected : today;
		month = date.getMonth();
		year = date.getFullYear();
		document.addEventListener("keydown", handleKeyPress);
		dispatch("open");
	}

	function monthSelected(e) {
		if (onlyMonth) {
			const date = new Date(year, e.detail, 1);
			registerSelection(date);
		}

		return changeMonth(e.detail);
	}

	// ********************************************* popover
	let once = (el, evt, cb) => {
		function handler() {
			cb.apply(this, arguments);
			el.removeEventListener(evt, handler);
		}
		el.addEventListener(evt, handler);
	};

	let w;
	let triggerContainer;
	let contentsAnimated;
	let contentsWrapper;
	let translateY = 0;
	let translateX = 0;

	export let closeOnClickOutside = true;
	export const closePopOver = () => {
		isClosing = true;
		once(contentsAnimated, "animationend", () => {
			isClosing = false;
			isOpen = false;
			dispatch("closed");
			registerClose();
		});
	};

	async function getDistanceToEdges() {
		if (!isOpen) {
			isOpen = true;
		}
		await tick();
		let rect = contentsWrapper.getBoundingClientRect();
		return {
			top: rect.top + -1 * translateY,
			bottom: window.innerHeight - rect.bottom + translateY,
			left: rect.left + -1 * translateX,
			right: document.body.clientWidth - rect.right + translateX,
		};
	}

	async function getTranslate() {
		let dist = await getDistanceToEdges();
		let x;
		let y;
		if (w < 480) {
			y = dist.bottom;
		} else if (dist.top < 0) {
			y = Math.abs(dist.top);
		} else if (dist.bottom < 0) {
			y = dist.bottom;
		} else {
			y = 0;
		}
		if (dist.left < 0) {
			x = Math.abs(dist.left);
		} else if (dist.right < 0) {
			x = dist.right;
		} else {
			x = 0;
		}
		return { x, y };
	}

	async function doOpenPopOver() {
		const { x, y } = await getTranslate();

		translateX = x;
		translateY = y;
		isOpen = true;

		dispatch("opened");
		registerOpen();
	}

	function clickOutside() {
		if (isOpen && closeOnClickOutside) {
			closePopOver();
		}
	}

	// ********************************************* navbar
	let monthSelectorOpen = defaultView === "month";
	let availableMonths;

	$: {
		let isOnLowerBoundary = start.getFullYear() === year;
		let isOnUpperBoundary = end.getFullYear() === year;
		availableMonths = monthsOfYear.map((m, i) => {
			return Object.assign(
				{},
				{
					name: m[0],
					abbrev: m[1],
				},
				{
					selectable:
						(!isOnLowerBoundary && !isOnUpperBoundary) ||
						((!isOnLowerBoundary || i >= start.getMonth()) && (!isOnUpperBoundary || i <= end.getMonth())),
				},
			);
		});
	}

	function toggleMonthSelectorOpen() {
		monthSelectorOpen = !monthSelectorOpen;
	}

	function navbarMonthSelected(event, { m, i }) {
		event.stopPropagation();
		if (!m.selectable) {
			return;
		}
		dispatch("monthSelected", i);
		toggleMonthSelectorOpen();
		monthSelected();
	}

	// ********************************************* month
	let id = visibleMonthId;

	let lastId = id;
	let direction;

	$: {
		direction = lastId < id ? 1 : -1;
		lastId = id;
	}

	onMount(() => {
		const date = selected ? selected : today;
		month = date.getMonth();
		year = date.getFullYear();

		// ******************* popover
		if (!trigger) {
			return;
		}

		triggerContainer.appendChild(trigger.parentNode.removeChild(trigger));
	});

	// async function getHelloWorld() {
	// 	const { app } = await webcomponent({ text: translate("hello", { name: "boilerplate" }) });

	// 	return app();
	// }
</script>

<svelte:window bind:innerWidth={w} />

<div id="webcomponent" part="webcomponent">
	<div class="datepicker" class:open={isOpen} class:closing={isClosing} style={wrapperStyle}>
		<div class="sc-popover" bind:this={popover} use:ClickOutside on:clickOutside={clickOutside}>
			<div class="trigger" on:click={doOpenPopOver} bind:this={triggerContainer}>
				<div slotx="trigger">
					<slot {selected} {formattedSelected}>
						{#if !trigger}
							<button class="calendar-button" type="button">
								{formattedSelected || "-"}
							</button>
						{/if}
					</slot>
				</div>
			</div>

			<div
				class="contents-wrapper"
				class:visible={isOpen}
				class:shrink={isClosing}
				style="transform: translate(-50%,-50%) translate({translateX}px, {translateY}px)"
				bind:this={contentsWrapper}
			>
				<div class="contents" bind:this={contentsAnimated}>
					<div class="contents-inner">
						{#if isOpen}
							<div slotx="contents">
								<div class="calendar-wrapper">
									<div class="calendar">
										<div class="Navbar title">
											<div class="heading-section">
												<div
													class="control"
													class:enabled={canDecrementMonth}
													on:click={() => incrementMonth(-1)}
												>
													<i class="arrow left" />
												</div>
												<div class="label" on:click={toggleMonthSelectorOpen}>
													{monthsOfYear[month][0]}
													{year}
												</div>
												<div
													class="control"
													class:enabled={canIncrementMonth}
													on:click={() => incrementMonth(1)}
												>
													<i class="arrow right" />
												</div>
											</div>
											<div class="month-selector" class:open={monthSelectorOpen}>
												{#each availableMonths as monthDefinition, index}
													<div
														class="month-selector--month"
														class:selected={index === month}
														class:selectable={monthDefinition.selectable}
														on:click={(e) =>
															navbarMonthSelected(e, { m: monthDefinition, i: index })}
													>
														<span>{monthDefinition.abbrev}</span>
													</div>
												{/each}
											</div>
										</div>

										<div class="legend">
											{#each sortedDaysOfWeek as day}
												<span>{day[1]}</span>
											{/each}
										</div>

										<div class="Month month-container">
											{#each visibleMonth.weeks as week (week.id)}
												<div
													class="Week week"
													in:fly|local={{ x: direction * 50, duration: 180, delay: 90 }}
													out:fade|local={{ duration: 180 }}
												>
													{#each week.days as day}
														<div
															class="day"
															class:outside-month={!day.partOfMonth}
															class:is-today={day.isToday}
															class:is-disabled={!day.selectable}
														>
															<button
																class="day--label"
																class:selected={areDatesEquivalent(day.date, selected)}
																class:highlighted={areDatesEquivalent(
																	day.date,
																	highlighted,
																)}
																class:shake-date={shouldShakeDate &&
																	areDatesEquivalent(day.date, shouldShakeDate)}
																class:disabled={!day.selectable}
																type="button"
																on:click={() => registerSelection(day.date)}
															>
																{day.date.getDate()}
															</button>
														</div>
													{/each}
												</div>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import "../styles/webcomponent.scss";
</style>
