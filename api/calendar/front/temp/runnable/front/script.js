/*
 * @Author: LetMeFly
 * @Date: 2025-01-03 21:58:45
 * @LastEditors: LetMeFly.xyz
 * @LastEditTime: 2025-01-09 16:04:13
 */
// script.js
document.addEventListener('DOMContentLoaded', function () {
    const globalDict = {};
    /************************** 初始化日期 **************************/
    const tableBody = document.querySelector('#calendarTable tbody');
    const dateRow = document.querySelector('#dateRow');
    const weekRange = document.querySelector('#weekRange');
    const prevWeekButton = document.querySelector('#prevWeek');
    const nextWeekButton = document.querySelector('#nextWeek');

    let currentDate = new Date(); // 当前日期

    // 生成时间行
    const hours = 24; // 24小时制
    for (let i = 0; i < hours; i++) {
        const row = document.createElement('tr');
        row.innerHTML = '<td>' + i + ':00</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>';
        tableBody.appendChild(row);
    }

    // 更新日期行和周范围显示
    function updateDates() {
        const startOfWeek = getStartOfWeek(currentDate);
        const oneDay_ths = dateRow.querySelectorAll('th');
        const hours_trs = tableBody.querySelectorAll('tr');

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            oneDay_ths[i + 1].querySelector('span').innerHTML = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
        }

        // 更新周范围显示
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        weekRange.textContent = startOfWeek.toLocaleDateString('zh-CN') + '-' + endOfWeek.toLocaleDateString('zh-CN');

        // 如果显示周是当前周，则高亮今天
        if (currentDate.toDateString() == getStartOfWeek(new Date()).toDateString()) {
            console.log('this week');
            const day = (new Date()).getDay();
            const index = day ? day : 7;  // 周日的下标是7
            oneDay_ths[index].classList.add('today');
            hours_trs.forEach(tr => {
                tr.querySelectorAll('td')[index].classList.add('today');
            });
        } else {
            oneDay_ths.forEach(th => th.classList.remove('today'));
            hours_trs.forEach(tr => {
                tr.querySelectorAll('td').forEach(td => td.classList.remove('today'));
            });
        }
    }

    /**
     * 获取当前周的周一
     * @param {Date} date - 当前日期
     * @returns {Date} - 周一日期
     */
    function getStartOfWeek(date) {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);  // 如果当前是周日，则减去6天
        return new Date(date.setDate(diff));
    }

    // 切换到上一周
    prevWeekButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 7);
        updateDates();
        renderEvent();
    });

    // 切换到下一周
    nextWeekButton.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 7);
        updateDates();
        renderEvent();
    });

    // 初始化日期
    updateDates();

    /*************************** 定义拖拽高亮 ***************************/
    // 高亮单元格逻辑（保持不变）
    let isDragging = false;
    let startCell = null;
    let endCell = null;

    tableBody.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'TD' && e.target.cellIndex !== 0) {
            isDragging = true;
            startCell = e.target;
            endCell = e.target;
            highlightCells(startCell, startCell);
        }
    });

    tableBody.addEventListener('mouseover', function (e) {
        if (isDragging && e.target.tagName === 'TD' && e.target.cellIndex !== 0) {
            endCell = e.target;
            highlightCells(startCell, endCell);
        }
    });

    tableBody.addEventListener('mouseup', function () {
        if (isDragging && startCell && endCell) {
            const startTime = calculateTimeFromCell(startCell);
            const endTime = calculateTimeFromCell(endCell, 1);  // 结束时间为下一个单元格
            showModal(startTime, endTime);
        }
        isDragging = false;
        startCell = null;
        endCell = null;
    });

    function highlightCells(start, end) {
        const startRow = start.parentElement.rowIndex;
        const startCol = start.cellIndex;
        const endRow = end.parentElement.rowIndex;

        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const Col = startCol;

        // 清除之前的高亮
        const allCells = tableBody.querySelectorAll('td');
        allCells.forEach(cell => cell.classList.remove('time-slot'));

        // 高亮选中的区域
        for (let i = minRow - 1; i <= maxRow - 1; i++) {  // 表头还有一行
            const cell = tableBody.rows[i].cells[Col];
            cell.classList.add('time-slot');
        }
    }
    

    /*************************** 事件创建 ***************************/
    // 获取弹出框相关元素
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    const eventForm = document.getElementById('eventForm');
    // 显示弹出框
    /**
     * 显示事件创建框
     * @param {string} startTime - 开始时间，如2023-10-05T22:30:00
     * @param {string} endTime   - 结束时间
     */
    function showModal(startTime, endTime) {
        document.getElementById('eventStartTime').value = startTime;
        document.getElementById('eventEndTime').value = endTime;
        modal.style.display = 'block';
    }
    // 隐藏弹出框
    function hideModal() {
        modal.style.display = 'none';
        tableBody.querySelectorAll('tr').forEach(tr => {
            tr.querySelectorAll('td').forEach(td => {
                td.classList.remove('time-slot');
            });
        });
    }
    // 点击关闭按钮隐藏弹出框
    closeBtn.addEventListener('click', hideModal);
    // 点击模态框外部隐藏弹出框
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    // 根据单元格计算时间
    function calculateTimeFromCell(cell, hourDiff=0) {
        const rowIndex = cell.parentElement.rowIndex - 1;  // 减去表头行
        const colIndex = cell.cellIndex - 1;  // 减去时间列
        const startOfWeek = getStartOfWeek(currentDate);
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + colIndex);
        date.setHours(rowIndex + 8 + hourDiff, 0, 0, 0);  // 转为UTC+8
        return date.toISOString().slice(0, 16);  // 转换为datetime-local格式
    }
    // 获取标签
    function loadTags() {
        console.log('loading tags');
        // const tagsUrl = 'back/tags.json';  // 记得修改为真正的相对路径
        const tagsUrl = './tags';
        fetch(tagsUrl, {
            credentials: 'include' // 包含Cookie
        })
        .then(response => response.json())
        .then(data => {
            const tagsContainer = document.getElementById('tagsContainer');
            tagsContainer.innerHTML = data.map(tag => '\
                <label>\
                    <input type="checkbox" name="tags" value="' + tag.tagId + '">\
                    <span style="background-color: ' + tag.tagColor + '">' + tag.tagName + '</span>\
                </label>\
            ').join('');
        })
        .catch(error => console.error('Error loading tags:', error));
    }
    setTimeout(() => {
        loadTags();
    }, 10);
    // 提交表单
    eventForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            // startTime: new Date(new Date(document.getElementById('eventStartTime').value).getTime() - 8 * 3600 * 1000).toISOString().slice(0, 16) + ':00',
            startTime: new Date(document.getElementById('eventStartTime').value).toISOString().slice(0, 16) + ':00',
            during: (new Date(document.getElementById('eventEndTime').value) - new Date(document.getElementById('eventStartTime').value)) / 60000, // 转换为分钟
            tags: Array.from(document.querySelectorAll('input[name="tags"]:checked')).map(input => parseInt(input.value))
        };
        // const eventUrl = 'back/event';  // 记得修改为真正
        const eventUrl = './events';
        fetch(eventUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // 包含Cookie
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === 'ok') {
                alert('事件创建成功！');
                hideModal();
            } else {
                alert('事件创建失败！');
            }
        })
        .catch(error => console.error('Error creating event:', error));
    });


    /*************************** 显示本周事件 ***************************/
    /**
     * 将事件数据渲染到日历上
     * @param {JSON} events - 事件列表
     */
    function renderEvent() {
        const events = globalDict['events'];
        const tableBody = document.querySelector('#calendarTable tbody');
        const rows = tableBody.querySelectorAll('tr');

        // 清空之前的事件渲染
        rows.forEach(row => {
            for (let i = 1; i < row.cells.length; i++) {
                row.cells[i].innerHTML = ''; // 清空单元格内容
                row.cells[i].style.backgroundColor = ''; // 清空背景色
                row.cells[i].removeAttribute('title'); // 移除悬浮提示
            }
        });
        
        // 获取当前周的起始和结束时间
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // 遍历事件并渲染
        events.forEach(event => {
            // 将 UTC 时间转换为 UTC+8 时间
            const startTime = new Date(event.startTime);
            const utcPlus8Offset = 8 * 60; // UTC+8 的分钟偏移量
            const localStartTime = new Date(startTime.getTime() + utcPlus8Offset * 60000);

            const endTime = new Date(localStartTime.getTime() + event.during * 60000);

            // 过滤非本周事件
            if (localStartTime > endOfWeek || endTime < startOfWeek) {
                return; // 跳过非本周事件
            }

            const startHour = localStartTime.getHours();
            const startMinute = localStartTime.getMinutes();
            const endHour = endTime.getHours();
            const endMinute = endTime.getMinutes();

            // 计算事件跨越的行数
            const startRow = startHour;
            const endRow = endHour + (endMinute > 0 ? 1 : 0);

            // 计算事件所在的列（星期几）
            const dayOfWeek = localStartTime.getDay();
            const colIndex = dayOfWeek === 0 ? 7 : dayOfWeek; // 周日是第7列

            // 创建事件块
            const eventBlock = document.createElement('div');
            eventBlock.className = 'event-block';
            eventBlock.textContent = event.title;

            // 添加悬浮提示
            eventBlock.setAttribute('title', `
                Title: ${event.title}\n
                Description: ${event.description}\n
                Start Time: ${localStartTime.toLocaleString()}\n
                End Time: ${endTime.toLocaleString()}
            `);

            // 计算事件块的起始位置和高度
            let top = 0;
            let height = 0;

            if (startRow === endRow - 1) {
                // 事件在同一行
                top = (startMinute / 60) * 100;
                height = ((endMinute - startMinute) / 60) * 100;
            } else {
                // 事件跨越多行
                if (startRow < endRow - 1) {
                    // 起始行
                    top = (startMinute / 60) * 100;
                    height = 100 - top;

                    // 中间行
                    for (let i = startRow + 1; i < endRow - 1; i++) {
                        const cell = rows[i].cells[colIndex];
                        if (!cell) continue;

                        const middleBlock = eventBlock.cloneNode(true);
                        middleBlock.style.top = '0';
                        middleBlock.style.height = '100%';
                        cell.appendChild(middleBlock);
                    }

                    // 结束行
                    const endCell = rows[endRow - 1].cells[colIndex];
                    if (endCell) {
                        const endBlock = eventBlock.cloneNode(true);
                        endBlock.style.top = '0';
                        endBlock.style.height = `${(endMinute / 60) * 100}%`;
                        endCell.appendChild(endBlock);
                    }
                }
            }

            // 设置事件块的样式
            eventBlock.style.top = `${top}%`;
            eventBlock.style.height = `${height}%`;

            // 将事件块添加到起始单元格
            const startCell = rows[startRow].cells[colIndex];
            if (startCell) {
                startCell.appendChild(eventBlock);
            }
        });
    }

    // 加载并显示事件
    function showEvent() {
        console.log('loading events');
        const tagsUrl = 'back/events.json';  // 记得修改为真正的相对路径
        // const tagsUrl = './events';
        fetch(tagsUrl, {
            credentials: 'include' // 包含Cookie
        })
        .then(response => response.json())
        .then(data => {
            globalDict['events'] = data;
            renderEvent();
        })
        .catch(error => console.error('Error loading events:', error));
    }

    setTimeout(() => {
        showEvent();
    }, 10);
});