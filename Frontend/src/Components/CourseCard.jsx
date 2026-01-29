import { useState } from 'react';
import './CourseCard.css';

const CourseCard = ({ course }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="course-card">
            <div className="course-header">
                <div className="course-info">
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                        <span className="course-duration">⏱️ {course.duration}</span>
                        <span className="course-lessons">📚 {course.topics.length} temas</span>
                    </div>
                </div>
                <button 
                    className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                    onClick={toggleExpand}
                >
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>
            
            {isExpanded && (
                <div className="course-topics">
                    <h4>Temas del curso:</h4>
                    <ul>
                        {course.topics.map((topic, index) => (
                            <li key={index} className="topic-item">
                                <span className="topic-number">{index + 1}</span>
                                <span className="topic-name">{topic}</span>
                            </li>
                        ))}
                    </ul>
                    <button className="start-course-btn">
                        Comenzar Curso
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseCard;