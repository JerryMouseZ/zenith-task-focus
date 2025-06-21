package com.zenith.taskfocus.presentation.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    onNavigateToAuth: () -> Unit,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    
    val tabs = listOf(
        "优先矩阵" to Icons.Default.Dashboard,
        "所有任务" to Icons.Default.List,
        "日历" to Icons.Default.CalendarToday,
        "分析" to Icons.Default.Analytics
    )
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        TopAppBar(
            title = {
                Text(
                    text = "ZenithTask",
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = { /* TODO: Quick Add */ }) {
                    Icon(Icons.Default.Add, contentDescription = "Quick Add")
                }
                IconButton(onClick = { 
                    viewModel.signOut()
                    onNavigateToAuth()
                }) {
                    Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out")
                }
            }
        )
        
        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, (title, icon) ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) },
                    icon = { Icon(icon, contentDescription = title) }
                )
            }
        }
        
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentAlignment = Alignment.Center
        ) {
            when (selectedTab) {
                0 -> PriorityMatrixPlaceholder()
                1 -> TaskListPlaceholder()
                2 -> CalendarPlaceholder()
                3 -> AnalyticsPlaceholder()
            }
        }
    }
}

@Composable
fun PriorityMatrixPlaceholder() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "优先矩阵",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "基于艾森豪威尔矩阵的任务优先级管理",
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
fun TaskListPlaceholder() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "所有任务",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "查看和管理所有任务",
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
fun CalendarPlaceholder() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "日历视图",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "基于时间的任务安排",
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}

@Composable
fun AnalyticsPlaceholder() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "数据分析",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "任务完成情况和生产力洞察",
            modifier = Modifier.padding(top = 8.dp)
        )
    }
}
