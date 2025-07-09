# 机器人建筑展示系统交互设计方案

## 📱 整体交互流程设计

### 阶段一：欢迎与准备 (5分钟)
```
用户进入 → 系统欢迎 → 基本信息收集 → 实验说明 → 准备确认
```

**交互事件序列：**
1. **欢迎界面**
   - 触发事件：用户进入系统
   - 交互内容：显示欢迎信息、研究目的说明
   - 用户操作：点击"开始参与"按钮

2. **基本信息收集**
   - 触发事件：用户确认参与
   - 交互内容：基本信息表单（年龄、性别、职业等）
   - 用户操作：填写表单、提交信息

3. **实验说明**
   - 触发事件：信息提交完成
   - 交互内容：展示实验流程、注意事项
   - 用户操作：阅读并确认理解

### 阶段二：预期调查 (3分钟)
```
初始印象调查 → 理想偏好收集 → 重要性排序
```

**交互事件序列：**
1. **初始印象收集**
   - 触发事件：进入预期调查
   - 交互内容：对机器人建筑的第一印象调查
   - 用户操作：选择选项、滑动评分条

2. **偏好预期设定**
   - 触发事件：印象调查完成
   - 交互内容：理想房屋类型、重视因素选择
   - 用户操作：多选题勾选、拖拽排序

### 阶段三：房屋展示与实时反馈 (15分钟)
```
随机展示顺序 → 房屋A展示 → 实时反馈 → 房屋B展示 → 实时反馈 → 房屋C展示 → 实时反馈
```

**交互事件序列：**
1. **展示准备**
   - 触发事件：预期调查完成
   - 交互内容：随机确定展示顺序、播放准备提示
   - 用户操作：点击"开始观看"

2. **房屋展示播放**
   - 触发事件：用户确认开始
   - 交互内容：3D模型展示/视频播放/机器人搭建过程
   - 用户操作：观看、可暂停/重播、实时点赞/点踩

3. **实时情感反馈**
   - 触发事件：展示过程中
   - 交互内容：情感滑块、关键时刻标记
   - 用户操作：拖拽情感值、点击"印象深刻"按钮

4. **单次展示评估**
   - 触发事件：单个房屋展示完成
   - 交互内容：5维度快速评分（外观、功能、过程、信任、居住意愿）
   - 用户操作：点击星级评分、简短文字评价

### 阶段四：对比评估 (8分钟)
```
三房屋对比展示 → 偏好排序 → 详细评估 → 选择原因分析
```

**交互事件序列：**
1. **对比界面**
   - 触发事件：所有房屋展示完成
   - 交互内容：三种房屋并排对比展示
   - 用户操作：拖拽排序、点击查看详情

2. **详细评估**
   - 触发事件：初步排序完成
   - 交互内容：李克特量表详细评估
   - 用户操作：滑动评分条、选择理由

3. **价格敏感度测试**
   - 触发事件：详细评估完成
   - 交互内容：不同价格情况下的选择变化
   - 用户操作：在价格变化时重新选择

### 阶段五：深度访谈 (10分钟)
```
开放性问题 → 语音/文字回答 → 建议收集 → 未来期望
```

**交互事件序列：**
1. **开放性回答**
   - 触发事件：量化评估完成
   - 交互内容：开放性问题逐一呈现
   - 用户操作：语音录制/文字输入

2. **个性化探索**
   - 触发事件：基础问题回答完成
   - 交互内容：基于前面回答的个性化深度问题
   - 用户操作：详细描述、举例说明

---

## 💻 用户界面交互设计

### 主界面布局
```
┌─────────────────────────────────────┐
│  标题栏：进度指示器 + 阶段名称        │
├─────────────────────────────────────┤
│                                     │
│         主内容区域                   │
│     (展示内容/问卷/对比界面)          │
│                                     │
├─────────────────────────────────────┤
│  底部操作栏：上一步 | 暂停 | 下一步   │
└─────────────────────────────────────┘
```

### 关键交互组件

#### 1. 情感反馈滑块
```javascript
// 实时情感追踪组件
<EmotionSlider>
  范围：-3 (非常不喜欢) 到 +3 (非常喜欢)
  实时更新：每秒记录一次数值
  视觉反馈：滑块颜色渐变，表情符号变化
</EmotionSlider>
```

#### 2. 星级评分组件
```javascript
// 多维度评分组件
<StarRating dimensions={[
  "外观吸引力", "功能合理性", "过程观感", 
  "质量信任度", "居住意愿"
]}>
  交互：点击星星、悬停预览
  反馈：即时高亮、动画效果
</StarRating>
```

#### 3. 拖拽排序组件
```javascript
// 偏好排序交互
<DragRanking items={["大型房屋", "中型房屋", "小型房屋"]}>
  交互：拖拽重排、点击微调
  反馈：拖拽阴影、位置指示线
</DragRanking>
```

#### 4. 对比展示组件
```javascript
// 房屋对比界面
<ComparisonView>
  布局：三列并排或卡片切换
  交互：点击放大、滑动查看、标签筛选
  功能：同步滚动、特征高亮
</ComparisonView>
```

---

## 🎮 交互事件处理逻辑

### 数据收集事件
```javascript
// 事件监听器注册
const EventHandlers = {
  // 页面访问追踪
  onPageEnter: (page) => {
    recordEvent({
      type: 'page_enter',
      page: page,
      timestamp: Date.now(),
      sessionId: getCurrentSession()
    });
  },

  // 展示观看追踪
  onVideoWatch: (houseType, progress) => {
    recordEvent({
      type: 'video_progress',
      houseType: houseType,
      progress: progress,
      timestamp: Date.now()
    });
  },

  // 实时情感追踪
  onEmotionChange: (value, timestamp) => {
    recordEvent({
      type: 'emotion_change',
      value: value,
      timestamp: timestamp,
      currentContent: getCurrentContent()
    });
  },

  // 评分事件
  onRatingChange: (dimension, value) => {
    recordEvent({
      type: 'rating_change',
      dimension: dimension,
      value: value,
      houseType: getCurrentHouse()
    });
  },

  // 排序事件
  onRankingChange: (newOrder) => {
    recordEvent({
      type: 'ranking_change',
      order: newOrder,
      timestamp: Date.now()
    });
  },

  // 语音输入事件
  onVoiceInput: (question, audioBlob) => {
    recordEvent({
      type: 'voice_input',
      question: question,
      audioData: audioBlob,
      duration: audioBlob.size
    });
  }
};
```

### 自适应交互逻辑
```javascript
// 基于用户行为的自适应界面
const AdaptiveLogic = {
  // 根据用户特征调整界面
  adaptInterface: (userProfile) => {
    if (userProfile.age > 50) {
      increaseTextSize();
      simplifyInterface();
    }
    if (userProfile.techSavvy === 'low') {
      enableGuidanceTooltips();
      addExtraConfirmations();
    }
  },

  // 基于反应调整问题深度
  adaptQuestions: (currentResponses) => {
    if (hasStrongPreference(currentResponses)) {
      addDeepDiveQuestions();
    }
    if (showsConfusion(currentResponses)) {
      addClarificationQuestions();
    }
  },

  // 个性化后续问题
  generateFollowUp: (answers) => {
    return personalizedQuestions.filter(q => 
      q.triggerCondition(answers)
    );
  }
};
```

---

## 📊 数据采集交互机制

### 实时数据收集
```javascript
// 多维度数据采集器
class DataCollector {
  constructor() {
    this.metrics = {
      timeSpent: new TimeTracker(),
      interactions: new InteractionLogger(),
      emotions: new EmotionTracker(),
      attention: new AttentionTracker()
    };
  }

  // 页面停留时间
  trackTimeOnPage(pageId) {
    this.metrics.timeSpent.start(pageId);
  }

  // 鼠标/触摸交互
  trackInteractions() {
    document.addEventListener('click', this.logClick);
    document.addEventListener('scroll', this.logScroll);
    document.addEventListener('mousemove', this.logMouseMove);
  }

  // 关键时刻标记
  markKeyMoment(type, data) {
    this.metrics.interactions.log({
      type: 'key_moment',
      category: type,
      data: data,
      timestamp: performance.now()
    });
  }

  // 注意力热点分析
  trackAttention() {
    // 模拟眼动追踪
    setInterval(() => {
      const activeElement = document.elementFromPoint(
        this.lastMouseX, this.lastMouseY
      );
      this.metrics.attention.record(activeElement);
    }, 100);
  }
}
```

### 数据验证与处理
```javascript
// 数据质量控制
const DataValidator = {
  // 检查回答完整性
  validateCompleteness: (responses) => {
    const required = ['demographics', 'preferences', 'ratings'];
    return required.every(section => 
      responses[section] && responses[section].length > 0
    );
  },

  // 检查回答一致性
  validateConsistency: (responses) => {
    // 检查前后回答是否矛盾
    const initialPreference = responses.initial.houseType;
    const finalRanking = responses.final.ranking[0];
    return initialPreference === finalRanking || 
           hasValidReasonForChange(responses);
  },

  // 异常值检测
  detectAnomalies: (data) => {
    return {
      tooFast: data.totalTime < MINIMUM_EXPECTED_TIME,
      inconsistent: hasInconsistentRatings(data.ratings),
      suspicious: hasSuspiciousPatterns(data.interactions)
    };
  }
};
```

---

## 🎯 交互优化策略

### 用户体验优化
```javascript
// UX 优化配置
const UXOptimizations = {
  // 减少认知负担
  cognitiveLoad: {
    questionsPerPage: 3,  // 每页最多3个问题
    progressIndicator: true,  // 显示进度
    autoSave: true,  // 自动保存进度
    allowBack: true  // 允许返回修改
  },

  // 提升参与度
  engagement: {
    animations: 'subtle',  // 微妙动画效果
    feedback: 'immediate',  // 即时反馈
    gamification: {
      progressBadges: true,  // 进度徽章
      completionRewards: true  // 完成奖励
    }
  },

  // 无障碍设计
  accessibility: {
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrastMode: true,
    fontSize: 'adjustable'
  }
};
```

### 错误处理与恢复
```javascript
// 错误处理机制
const ErrorHandling = {
  // 网络中断恢复
  handleNetworkError: () => {
    showMessage('网络连接中断，数据已保存到本地');
    enableOfflineMode();
    autoRetryWhenOnline();
  },

  // 数据丢失预防
  preventDataLoss: () => {
    setInterval(saveToLocalStorage, 30000);  // 每30秒保存
    window.addEventListener('beforeunload', confirmExit);
  },

  // 用户反馈收集
  collectErrorFeedback: (error) => {
    showOptionalFeedbackForm({
      error: error.message,
      context: getCurrentState(),
      allowAnonymous: true
    });
  }
};
```

---

## 🔧 技术实现建议

### 前端技术栈
- **框架**: React/Vue.js (响应式界面)
- **状态管理**: Redux/Vuex (数据状态)
- **动画**: Framer Motion (流畅交互)
- **图表**: D3.js/Chart.js (数据可视化)
- **录音**: MediaRecorder API (语音收集)

### 后端数据处理
- **数据库**: MongoDB (灵活数据结构)
- **实时通信**: WebSocket (实时数据传输)
- **分析引擎**: Python + Pandas (数据分析)
- **机器学习**: scikit-learn (模式识别)

### 部署与监控
- **云平台**: AWS/Azure (可扩展部署)
- **监控**: Google Analytics + 自定义事件
- **A/B测试**: 多版本交互方案对比
- **数据安全**: 端到端加密、匿名化处理

这套交互设计确保了数据收集的全面性和用户体验的流畅性，为你的研究提供高质量的用户偏好数据。