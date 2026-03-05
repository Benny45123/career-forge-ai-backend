pipeline{
    agent any
    stages{
        stage('Checkout'){
            steps{
            echo 'Checking out code...'
            //checkout node version
            sh 'node -v'
            //checkout npm
            sh 'npm -v'
            }
        }
        stage('Install Dependencies'){
            steps{
            echo 'Installing dependencies...'
            sh 'npm install'
            }
        }
        stage('Run Build and Tests'){
            steps{
            echo 'Running build and tests...'
            //sh 'npm run build'
            //sh 'npm test'
            }
        }
        stage('Run Application'){
            steps{
            echo 'Running application...'
            sh 'node app.js'
            }
        }
    }
}