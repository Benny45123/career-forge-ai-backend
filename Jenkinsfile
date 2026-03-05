pipeline{
    agent any
    stages{
        stage('Checkout'){
            echo 'Checking out code...'
            //checkout node version
            sh 'node -v'
            //checkout npm
            sh 'npm -v'
        }
        stage('Install Dependencies'){
            echo 'Installing dependencies...'
            sh 'npm install'
        }
        stage('Run Build and Tests'){
            echo 'Running build and tests...'
            //sh 'npm run build'
            //sh 'npm test'
        }
        stage('Run Application'){
            echo 'Running application...'
            sh 'npm start'
        }
    }
}